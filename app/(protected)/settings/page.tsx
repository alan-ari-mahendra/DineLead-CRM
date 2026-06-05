"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { User, Bell, Database, Shield, CreditCard, Crown, BookOpen, Terminal, LifeBuoy, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type TabId = "profile" | "notifications" | "security" | "data";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  const tabs = [
    { id: "profile" as TabId, label: "Profile", icon: User, description: "Personal details and credentials" },
    { id: "notifications" as TabId, label: "Notifications", icon: Bell, description: "Email and push preferences" },
    { id: "security" as TabId, label: "Security", icon: Shield, description: "Password and API access" },
    { id: "data" as TabId, label: "Data Management", icon: Database, description: "Export, import, and backup" },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-5 md:p-6 lg:p-8 flex flex-col gap-6">
      
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage your account credentials, notifications, and application data.</p>
      </div>

      {/* ── Settings Layout Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        
        {/* ── Left Side: Tabs & Active Content (8 Columns) ── */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          
          {/* Tabs Navigation */}
          <div className="bg-white border border-gray-100 rounded-2xl p-1.5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] gap-1 w-full">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 min-w-[130px] md:min-w-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group whitespace-nowrap",
                    isActive
                      ? "bg-emerald-50 text-emerald-800 shadow-[0_1px_2px_rgba(4,120,87,0.05)] border border-emerald-100/50"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50/80"
                  )}
                >
                  <tab.icon className={cn(
                    "h-4 w-4 mr-2 transition-colors",
                    isActive ? "text-emerald-700" : "text-gray-400 group-hover:text-gray-600"
                  )} />
                  <span className="tracking-tight">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Content Card */}
          <Card className="bg-white border border-gray-100 rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="p-6 md:p-8">
              {activeTab === "profile" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-base font-bold text-gray-900 tracking-tight">Profile Settings</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Update your personal information, organization details, and avatar.</p>
                  </div>
                  
                  {/* Avatar Section */}
                  <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-gray-100/80">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white flex items-center justify-center text-xl font-bold shadow-md">
                      JD
                    </div>
                    <div className="flex flex-col gap-1.5 items-center sm:items-start text-center sm:text-left">
                      <h3 className="text-sm font-bold text-gray-800">Profile Picture</h3>
                      <p className="text-xs text-gray-400">PNG, JPG or GIF. Max 2MB.</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Button size="sm" variant="outline" className="h-8 text-xs font-semibold px-3 rounded-lg border-gray-200 hover:bg-gray-50 text-gray-700">
                          Upload Image
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 text-xs font-semibold px-3 rounded-lg text-gray-400 hover:text-red-500">
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Form Fields Grid */}
                  <div className="space-y-5 w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Company / Workspace</Label>
                        <Input 
                          id="company" 
                          defaultValue="DineLead Corp" 
                          className="border-gray-200 bg-gray-50/30 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 focus:bg-white transition-all rounded-xl h-10 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Job Title</Label>
                        <Input 
                          id="role" 
                          defaultValue="Sales Director" 
                          className="border-gray-200 bg-gray-50/30 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 focus:bg-white transition-all rounded-xl h-10 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone Number</Label>
                      <Input 
                        id="phone" 
                        defaultValue="+62 812-3456-7890" 
                        className="border-gray-200 bg-gray-50/30 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 focus:bg-white transition-all rounded-xl h-10 text-sm"
                      />
                    </div>

                    <div className="pt-2">
                      <Button className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl h-10 px-6 shadow-sm transition-all">
                        Save Profile Changes
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-base font-bold text-gray-900 tracking-tight">Notification Preferences</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Control how and when you receive updates, reports, and lead alerts.</p>
                  </div>
                  
                  {/* General Notifications */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">System Alerts</h3>
                    <div className="divide-y divide-gray-100 w-full border border-gray-100 rounded-2xl bg-gray-50/30 px-5">
                      <div className="flex items-center justify-between py-4">
                        <div className="space-y-0.5 pr-4">
                          <Label htmlFor="email-notifications" className="text-sm font-semibold text-gray-800">Email Notifications</Label>
                          <p className="text-xs text-gray-400">Receive lead summaries and export links via email.</p>
                        </div>
                        <Switch id="email-notifications" defaultChecked className="data-[state=checked]:bg-emerald-600" />
                      </div>
                      <div className="flex items-center justify-between py-4">
                        <div className="space-y-0.5 pr-4">
                          <Label htmlFor="push-notifications" className="text-sm font-semibold text-gray-800">Push Notifications</Label>
                          <p className="text-xs text-gray-400">Get alerts on browser when scraping tasks complete.</p>
                        </div>
                        <Switch id="push-notifications" className="data-[state=checked]:bg-emerald-600" />
                      </div>
                      <div className="flex items-center justify-between py-4">
                        <div className="space-y-0.5 pr-4">
                          <Label htmlFor="weekly-reports" className="text-sm font-semibold text-gray-800">Weekly Reports</Label>
                          <p className="text-xs text-gray-400">Get a weekly conversion and status report.</p>
                        </div>
                        <Switch id="weekly-reports" defaultChecked className="data-[state=checked]:bg-emerald-600" />
                      </div>
                    </div>
                  </div>

                  {/* Lead Alerts */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lead Alert Channels</h3>
                    <div className="divide-y divide-gray-100 w-full border border-gray-100 rounded-2xl bg-gray-50/30 px-5">
                      <div className="flex items-center justify-between py-4">
                        <div className="space-y-0.5 pr-4">
                          <Label htmlFor="instant-lead-alert" className="text-sm font-semibold text-gray-800">Instant Lead Extraction Alert</Label>
                          <p className="text-xs text-gray-400">Notify immediately when a new high-value prospect is scraped.</p>
                        </div>
                        <Switch id="instant-lead-alert" defaultChecked className="data-[state=checked]:bg-emerald-600" />
                      </div>
                      <div className="flex items-center justify-between py-4">
                        <div className="space-y-0.5 pr-4">
                          <Label htmlFor="slack-integration" className="text-sm font-semibold text-gray-800">Slack Integration</Label>
                          <p className="text-xs text-gray-400">Push lead notifications to your team's Slack channel.</p>
                        </div>
                        <Switch id="slack-integration" className="data-[state=checked]:bg-emerald-600" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-base font-bold text-gray-900 tracking-tight">Security Settings</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Manage password credentials, active access tokens, and login sessions.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                    <Card className="bg-white border border-gray-100 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-emerald-100 transition-all flex flex-col gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">Password</h3>
                        <p className="text-xs text-gray-400 mt-1 leading-normal">Update or change your account login password.</p>
                      </div>
                      <Button variant="outline" className="w-full mt-auto bg-white border-gray-200 text-gray-700 hover:bg-gray-50 h-9 text-xs font-semibold rounded-lg transition-all">
                        Change Password
                      </Button>
                    </Card>

                    <Card className="bg-white border border-gray-100 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-emerald-100 transition-all flex flex-col gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">Two-Factor Auth</h3>
                        <p className="text-xs text-gray-400 mt-1 leading-normal">Secure your account with multi-factor authentication.</p>
                      </div>
                      <Button variant="outline" className="w-full mt-auto bg-white border-gray-200 text-gray-700 hover:bg-gray-50 h-9 text-xs font-semibold rounded-lg transition-all">
                        Enable 2FA
                      </Button>
                    </Card>

                    <Card className="bg-white border border-gray-100 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-emerald-100 transition-all flex flex-col gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">API Keys</h3>
                        <p className="text-xs text-gray-400 mt-1 leading-normal">Manage API access credentials for external tools.</p>
                      </div>
                      <Button variant="outline" className="w-full mt-auto bg-white border-gray-200 text-gray-700 hover:bg-gray-50 h-9 text-xs font-semibold rounded-lg transition-all">
                        Manage Keys
                      </Button>
                    </Card>
                  </div>

                  {/* Active Sessions */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">Active Sessions</h3>
                        <p className="text-xs text-gray-400">Devices currently logged into your account.</p>
                      </div>
                      <Button variant="ghost" className="h-8 text-xs font-bold text-emerald-700 hover:text-emerald-800 self-start sm:self-auto p-0">
                        Sign out of all other devices
                      </Button>
                    </div>
                    
                    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-gray-50/20">
                      <div className="p-4 flex items-center justify-between border-b border-gray-100 last:border-0 bg-white">
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                          <div>
                            <p className="text-xs font-semibold text-gray-800">Chrome on Windows · Jakarta, ID</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">Current session · IP: 182.253.30.12</p>
                          </div>
                        </div>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-100/50">Active Now</span>
                      </div>
                      <div className="p-4 flex items-center justify-between bg-white">
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                          <div>
                            <p className="text-xs font-semibold text-gray-800">Safari on iPhone · Jakarta, ID</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">Last active 4 hours ago · IP: 182.253.30.12</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 text-[10px] text-gray-400 hover:text-red-500 font-semibold">Revoke</Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "data" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-base font-bold text-gray-900 tracking-tight">Data Management</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Control your business records, backups, and deletions.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                    <Card className="bg-white border border-gray-100 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-emerald-100 transition-all flex flex-col gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">Export All Data</h3>
                        <p className="text-xs text-gray-400 mt-1 leading-normal">Download all your leads and workspace details in JSON.</p>
                      </div>
                      <Button variant="outline" className="w-full mt-auto bg-white border-gray-200 text-gray-700 hover:bg-gray-50 h-9 text-xs font-semibold rounded-lg transition-all">
                        Export Data
                      </Button>
                    </Card>

                    <Card className="bg-white border border-gray-100 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-emerald-100 transition-all flex flex-col gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">Import Workspace</h3>
                        <p className="text-xs text-gray-400 mt-1 leading-normal">Restore your leads database from a backup file.</p>
                      </div>
                      <Button variant="outline" className="w-full mt-auto bg-white border-gray-200 text-gray-700 hover:bg-gray-50 h-9 text-xs font-semibold rounded-lg transition-all">
                        Import Backup
                      </Button>
                    </Card>

                    <Card className="bg-white border border-red-100 rounded-xl p-5 shadow-[0_1px_3px_rgba(239,68,68,0.04)] hover:shadow-md hover:border-red-200 transition-all flex flex-col gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-red-600">Danger Zone</h3>
                        <p className="text-xs text-red-400 mt-1 leading-normal">Permanently delete all workspace data. This cannot be undone.</p>
                      </div>
                      <Button variant="destructive" className="w-full mt-auto bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 shadow-none h-9 text-xs font-semibold rounded-lg transition-all">
                        Clear All Data
                      </Button>
                    </Card>
                  </div>

                  {/* Backup History */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Recent Backups</h3>
                      <p className="text-xs text-gray-400">Download previous backups or schedule a restoration.</p>
                    </div>
                    
                    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-gray-50/20">
                      <div className="p-4 flex items-center justify-between border-b border-gray-100 bg-white">
                        <div>
                          <p className="text-xs font-semibold text-gray-800">dinelead_backup_2026_06_04.json</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Size: 1.24 MB · 1,429 restaurant records</p>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 font-bold rounded-lg px-3">Download</Button>
                      </div>
                      <div className="p-4 flex items-center justify-between bg-white">
                        <div>
                          <p className="text-xs font-semibold text-gray-800">dinelead_backup_2026_05_28.json</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Size: 840 KB · 980 restaurant records</p>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 font-bold rounded-lg px-3">Download</Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

        </div>

        {/* ── Right Side: Account Context & Resource Center (4 Columns) ── */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          
          {/* Subscription & Usage Card */}
          <Card className="bg-white border border-gray-100 rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="p-6 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <Crown className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 leading-none">Pro Plan</h3>
                    <p className="text-[10px] text-gray-400 mt-1">Renews on July 5, 2026</p>
                  </div>
                </div>
                <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-100 shadow-none text-[10px] font-bold px-2 py-0.5 rounded-full hover:bg-emerald-50">
                  Active
                </Badge>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-50">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-gray-700">
                    <span>Scraped Leads</span>
                    <span>1,429 / 5,000</span>
                  </div>
                  <Progress value={28.5} className="h-2 bg-gray-100 [&>div]:bg-emerald-600 rounded-full" />
                  <p className="text-[10px] text-gray-400">28.5% of your monthly lead allowance used.</p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-gray-700">
                    <span>Active Scraping Jobs</span>
                    <span>3 / 10 slots</span>
                  </div>
                  <Progress value={30} className="h-2 bg-gray-100 [&>div]:bg-emerald-600 rounded-full" />
                  <p className="text-[10px] text-gray-400">3 concurrently running scraper tasks active.</p>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <Link href="/settings/billing" className="flex-1">
                  <Button variant="outline" className="w-full h-9 text-xs font-semibold border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl transition-all">
                    Manage Billing
                  </Button>
                </Link>
                <Link href="/settings/billing" className="flex-1">
                  <Button className="w-full h-9 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-sm transition-all">
                    Upgrade Limit
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Quick Help & Resource Center */}
          <Card className="bg-white border border-gray-100 rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="p-6 flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 tracking-tight">Resource Center</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Need help configuring your workspace?</p>
              </div>

              <div className="flex flex-col gap-2">
                <Link 
                  href="https://dinelead.readme.io/docs" 
                  target="_blank" 
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100/80 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-gray-50 text-gray-400 group-hover:text-emerald-700 group-hover:bg-emerald-50 flex items-center justify-center transition-colors">
                      <BookOpen className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">Documentation</p>
                      <p className="text-[10px] text-gray-400">Learn how to extract leads</p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-emerald-700 transition-colors" />
                </Link>

                <Link 
                  href="https://dinelead.readme.io/reference" 
                  target="_blank" 
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100/80 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-gray-50 text-gray-400 group-hover:text-emerald-700 group-hover:bg-emerald-50 flex items-center justify-center transition-colors">
                      <Terminal className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">API Documentation</p>
                      <p className="text-[10px] text-gray-400">Integrate webhook notifications</p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-emerald-700 transition-colors" />
                </Link>

                <Link 
                  href="mailto:support@dinelead.com" 
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100/80 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-gray-50 text-gray-400 group-hover:text-emerald-700 group-hover:bg-emerald-50 flex items-center justify-center transition-colors">
                      <LifeBuoy className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">Customer Support</p>
                      <p className="text-[10px] text-gray-400">Talk to our product expert</p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-emerald-700 transition-colors" />
                </Link>
              </div>
            </div>
          </Card>

        </div>

      </div>
    </div>
  );
}
