import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { User, Bell, Database, Shield } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="page-bg min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage your account and application preferences.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Profile Settings */}
        <div className="bento-card p-7">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Profile Settings</h2>
              <p className="text-xs text-gray-400">Update your personal details</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-medium text-gray-500">Full Name</Label>
              <Input
                id="name"
                defaultValue="John Doe"
                className="border-gray-200 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-400"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-gray-500">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue="john.doe@example.com"
                className="border-gray-200 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-400"
              />
            </div>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
              Update Profile
            </Button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bento-card p-7">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
              <Bell className="h-4 w-4 text-violet-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Notifications</h2>
              <p className="text-xs text-gray-400">Control what alerts you receive</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { id: "email-notifications", label: "Email Notifications", sub: "Get notified via email", defaultChecked: true },
              { id: "push-notifications", label: "Push Notifications", sub: "Browser push alerts", defaultChecked: false },
              { id: "weekly-reports", label: "Weekly Reports", sub: "Summary every Monday", defaultChecked: true },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <Label htmlFor={item.id} className="text-sm font-medium text-gray-700 cursor-pointer">{item.label}</Label>
                  <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                </div>
                <Switch
                  id={item.id}
                  defaultChecked={item.defaultChecked}
                  className="data-[state=checked]:bg-emerald-600"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Data Management */}
        <div className="bento-card p-7">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Database className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Data Management</h2>
              <p className="text-xs text-gray-400">Import, export and manage your data</p>
            </div>
          </div>
          <div className="space-y-3">
            <Button variant="outline" className="w-full border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-800 justify-start gap-2">
              <Database className="h-4 w-4 text-emerald-500" />
              Export All Data
            </Button>
            <Button variant="outline" className="w-full border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-800 justify-start gap-2">
              <Database className="h-4 w-4 text-blue-500" />
              Import Data
            </Button>
            <Button variant="outline" className="w-full border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 justify-start gap-2">
              <Database className="h-4 w-4" />
              Clear All Data
            </Button>
          </div>
        </div>

        {/* Security */}
        <div className="bento-card p-7">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <Shield className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Security</h2>
              <p className="text-xs text-gray-400">Protect your account</p>
            </div>
          </div>
          <div className="space-y-3">
            <Button variant="outline" className="w-full border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-800 justify-start gap-2">
              <Shield className="h-4 w-4 text-amber-500" />
              Change Password
            </Button>
            <Button variant="outline" className="w-full border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-800 justify-start gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              Two-Factor Auth
            </Button>
            <Button variant="outline" className="w-full border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-800 justify-start gap-2">
              <Shield className="h-4 w-4 text-gray-400" />
              API Keys
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
