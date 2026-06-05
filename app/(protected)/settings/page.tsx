import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { User, Bell, Database, Shield } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] p-5 md:p-6 lg:p-8 flex flex-col gap-6">
      
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage your account credentials, notifications, and application data.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        
        {/* ── Profile Settings ── */}
        <Card className="bg-white border border-gray-100 rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
          <CardHeader className="px-6 pt-6 pb-4 border-b border-gray-50 bg-gray-50/20">
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <User className="h-4.5 w-4.5" />
              </div>
              <span className="text-base font-bold text-gray-900 tracking-tight">Profile Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</Label>
              <Input 
                id="name" 
                defaultValue="John Doe" 
                className="border-gray-200 bg-gray-50/30 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 focus:bg-white transition-all rounded-xl h-10 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                defaultValue="john.doe@example.com" 
                className="border-gray-200 bg-gray-50/30 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 focus:bg-white transition-all rounded-xl h-10 text-sm"
              />
            </div>
            <Button className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl h-10 shadow-sm transition-all mt-2">
              Update Profile
            </Button>
          </CardContent>
        </Card>

        {/* ── Notifications ── */}
        <Card className="bg-white border border-gray-100 rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
          <CardHeader className="px-6 pt-6 pb-4 border-b border-gray-50 bg-gray-50/20">
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <Bell className="h-4.5 w-4.5" />
              </div>
              <span className="text-base font-bold text-gray-900 tracking-tight">Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications" className="text-sm font-semibold text-gray-800">Email Notifications</Label>
                <p className="text-xs text-gray-400">Receive lead summaries and export links via email.</p>
              </div>
              <Switch id="email-notifications" defaultChecked className="data-[state=checked]:bg-emerald-600" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications" className="text-sm font-semibold text-gray-800">Push Notifications</Label>
                <p className="text-xs text-gray-400">Get alerts on browser when scraping tasks complete.</p>
              </div>
              <Switch id="push-notifications" className="data-[state=checked]:bg-emerald-600" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weekly-reports" className="text-sm font-semibold text-gray-800">Weekly Reports</Label>
                <p className="text-xs text-gray-400">Get a weekly conversion and conversion report.</p>
              </div>
              <Switch id="weekly-reports" defaultChecked className="data-[state=checked]:bg-emerald-600" />
            </div>
          </CardContent>
        </Card>

        {/* ── Data Management ── */}
        <Card className="bg-white border border-gray-100 rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
          <CardHeader className="px-6 pt-6 pb-4 border-b border-gray-50 bg-gray-50/20">
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <Database className="h-4.5 w-4.5" />
              </div>
              <span className="text-base font-bold text-gray-900 tracking-tight">Data Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            <Button variant="outline" className="w-full bg-white border-gray-200 text-gray-700 hover:bg-gray-50 h-10 font-semibold rounded-xl transition-all">
              Export All Data
            </Button>
            <Button variant="outline" className="w-full bg-white border-gray-200 text-gray-700 hover:bg-gray-50 h-10 font-semibold rounded-xl transition-all">
              Import Data
            </Button>
            <Button variant="destructive" className="w-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 shadow-none h-10 font-semibold rounded-xl transition-all">
              Clear All Data
            </Button>
          </CardContent>
        </Card>

        {/* ── Security ── */}
        <Card className="bg-white border border-gray-100 rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
          <CardHeader className="px-6 pt-6 pb-4 border-b border-gray-50 bg-gray-50/20">
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <Shield className="h-4.5 w-4.5" />
              </div>
              <span className="text-base font-bold text-gray-900 tracking-tight">Security Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            <Button variant="outline" className="w-full bg-white border-gray-200 text-gray-700 hover:bg-gray-50 h-10 font-semibold rounded-xl transition-all">
              Change Password
            </Button>
            <Button variant="outline" className="w-full bg-white border-gray-200 text-gray-700 hover:bg-gray-50 h-10 font-semibold rounded-xl transition-all">
              Two-Factor Auth
            </Button>
            <Button variant="outline" className="w-full bg-white border-gray-200 text-gray-700 hover:bg-gray-50 h-10 font-semibold rounded-xl transition-all">
              API Keys
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
