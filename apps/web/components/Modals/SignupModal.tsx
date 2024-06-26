import { zodResolver } from "@hookform/resolvers/zod"
import { getCurrentUser, loginUser, signupUser } from "app/actions/user.actions"
import { Button } from "components/Button/Button"
import { DialogFooter } from "components/Dialog/Dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "components/Form/Form"
import { GenericModal } from "components/GenericModal/GenericModal"
import { Input } from "components/Input/Input"
import { Logo } from "components/Logo/Logo"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { useModalStore } from "stores/modalStore"
import { useUserStore } from "stores/userStore"
import { z } from "zod"

const passwordRegexp = new RegExp(/(?=.*\d)(?=.*\W)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/)

const formSchema = z.object({
  email: z.string().email().min(3).max(64),
  password: z.string().min(8).max(20).regex(passwordRegexp, "Password must have at least one number, one symbol, one uppercase letter, and be at least 8 characters"),
})

const formFields = [
  { label: "Email", name: "email", type: "text", placeholder: "Enter email..." },
  { label: "Password", name: "password", type: "password", placeholder: "Enter password..." },
] as const

export function SignupModal() {
  const modals = useModalStore((s) => s.modals)
  const setUser = useUserStore((s) => s.setUser)
  const closeModal = useModalStore((s) => s.closeModal)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  const router = useRouter()

  async function onSubmit(payload: z.infer<typeof formSchema>) {
    const { email, password } = payload
    const user = await signupUser({ email, password })
    await loginUser({ email, password })
    if (user) {
      const currentUser = await getCurrentUser()
      currentUser && setUser(currentUser)

      closeModal("signup")
      toast.success("You have successfully signed up!")
      router.push('/settings')
      return
    }

    toast.error("Couldn't create user. The email address may be already in use.")
  }

  return (
    <GenericModal title="Signup" open={!!modals["signup"]} onOpenChange={() => closeModal("signup")}>
      <Form {...form}>
        <Logo className="mt-6 flex size-24 w-full justify-center" />
        {form.formState.errors.root?.message && <p className="mt-6 w-full text-[14px] leading-tight tracking-tight text-red-400">{form.formState.errors.root?.message}</p>}
        <form name="loginForm" id="loginForm" onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">
          {formFields.map((singleField) => (
            <FormField
              key={singleField.name}
              control={form.control}
              name={singleField.name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{singleField.label}</FormLabel>
                  <FormControl>
                    <Input type={singleField.type} className="text-sm" placeholder={singleField.placeholder} {...field} />
                  </FormControl>
                  <FormMessage className="text-xs font-normal text-red-400" />
                </FormItem>
              )}
            />
          ))}
        </form>
      </Form>

      <DialogFooter>
        <Button
          size="lg"
          form="loginForm"
          className="hover:text-white"
          variant="secondary"
          isAnimated={false}
          type="submit"
          disabled={form.formState.isSubmitting}
          isLoading={form.formState.isSubmitting}
        >
          Submit
        </Button>
      </DialogFooter>
    </GenericModal>
  )
}
