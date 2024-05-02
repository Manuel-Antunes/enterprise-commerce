import { getCurrentUser } from "app/actions/user.actions"
import { redirect } from "next/navigation"
import { SettingsView } from "views/Settings/SettingsView"

export default async function Settings() {
  const user = await getCurrentUser()
  if(!user) return redirect('/')

  return <SettingsView />
}
