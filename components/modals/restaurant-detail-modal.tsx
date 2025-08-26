"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { Calendar, Phone, Mail, MessageSquare, User, Clock } from "lucide-react"

interface RestaurantDetailModalProps {
  restaurant: any
  isOpen: boolean
  onClose: () => void
}

export function RestaurantDetailModal({ restaurant, isOpen, onClose }: RestaurantDetailModalProps) {
  const [notes, setNotes] = useState("")
  const [newActivity, setNewActivity] = useState("")
  const [activityType, setActivityType] = useState("contact")
  const [status, setStatus] = useState(restaurant?.status || "prospect")
  const [activityLog, setActivityLog] = useState([
    {
      id: 1,
      date: "2025-01-15",
      time: "10:30 AM",
      action: "Restaurant added to database",
      type: "system",
      user: "System",
      details: "Automatically scraped from Google Maps",
    },
    {
      id: 2,
      date: "2025-01-16",
      time: "2:15 PM",
      action: "Initial contact attempted via phone",
      type: "contact",
      user: "John Doe",
      details: "No answer, left voicemail",
    },
    {
      id: 3,
      date: "2025-01-18",
      time: "9:45 AM",
      action: "Follow-up email sent",
      type: "contact",
      user: "John Doe",
      details: "Sent introduction email with service details",
    },
    {
      id: 4,
      date: "2025-01-20",
      time: "11:20 AM",
      action: "Status updated to Contacted",
      type: "status",
      user: "John Doe",
      details: "",
    },
  ])

  if (!restaurant) return null

  const getStatusBadge = (status: string) => {
    const variants = {
      prospect: "bg-blue-100 text-blue-800 border-blue-200",
      contacted: "bg-yellow-100 text-yellow-800 border-yellow-200",
      closed: "bg-green-100 text-green-800 border-green-200",
    }
    return variants[status as keyof typeof variants] || variants.prospect
  }

  const handleAddActivity = () => {
    if (!newActivity.trim()) return

    const activity = {
      id: activityLog.length + 1,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      action: newActivity,
      type: activityType,
      user: "John Doe", // In real app, get from auth context
      details: "",
    }

    setActivityLog([activity, ...activityLog])
    setNewActivity("")
  }

  const handleStatusUpdate = () => {
    // In real app, this would make an API call
    console.log("Updating status to:", status)

    // Add activity log entry for status change
    const activity = {
      id: activityLog.length + 1,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      action: `Status updated to ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      type: "status",
      user: "John Doe",
      details: "",
    }

    setActivityLog([activity, ...activityLog])
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "contact":
        return <Phone className="h-4 w-4 text-blue-500" />
      case "email":
        return <Mail className="h-4 w-4 text-green-500" />
      case "meeting":
        return <Calendar className="h-4 w-4 text-purple-500" />
      case "status":
        return <User className="h-4 w-4 text-orange-500" />
      case "note":
        return <MessageSquare className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {restaurant.name}
            <Badge className={getStatusBadge(status)}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
          </DialogTitle>
          <DialogDescription>Manage restaurant details and track all interactions</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            {/* Restaurant Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                <p className="text-sm mt-1">{restaurant.address}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                <p className="text-sm mt-1">{restaurant.phone}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Rating</Label>
                <div className="flex items-center mt-1">
                  <span className="text-yellow-500 mr-1">★</span>
                  <span className="text-sm">{restaurant.rating}</span>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Website</Label>
                <p className="text-sm text-primary mt-1">www.example-restaurant.com</p>
              </div>
            </div>

            <Separator />

            {/* Status Management */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Status Management</h3>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Label htmlFor="status">Update Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="bg-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prospect">Prospect</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleStatusUpdate} className="mt-6 bg-primary hover:bg-primary/90">
                  Update Status
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            {/* Add New Activity */}
            <div className="space-y-4 p-4 bg-muted rounded-lg">
              <h3 className="text-lg font-semibold">Add New Activity</h3>
              <div className="flex space-x-2">
                <Select value={activityType} onValueChange={setActivityType}>
                  <SelectTrigger className="w-[140px] bg-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contact">Phone Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="note">Note</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Describe the activity..."
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  className="flex-1 bg-input"
                />
                <Button onClick={handleAddActivity} className="bg-primary hover:bg-primary/90">
                  Add
                </Button>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Activity Timeline</h3>
              <div className="space-y-4">
                {activityLog.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-3 p-3 bg-card rounded-lg border border-border"
                  >
                    <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>{activity.date}</span>
                          <span>{activity.time}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">by {activity.user}</p>
                      {activity.details && <p className="text-xs text-muted-foreground mt-1">{activity.details}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            {/* Notes Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Follow-up Notes</h3>
              <Textarea
                placeholder="Add notes about this restaurant, follow-up reminders, or important details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[200px] bg-input"
              />

              {/* Previous Notes */}
              <div className="space-y-3">
                <h4 className="font-medium">Previous Notes</h4>
                <div className="space-y-2">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      Owner seems interested in our catering services. Follow up next week with pricing details.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">Added on 2025-01-18 by John Doe</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">Restaurant has good online reviews. Potential for partnership.</p>
                    <p className="text-xs text-muted-foreground mt-2">Added on 2025-01-15 by John Doe</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
