"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import {
  Calendar,
  Phone,
  Mail,
  MessageSquare,
  User,
  Clock,
} from "lucide-react";
import { LeadActivity, LeadNote } from "@/types/restaurant.type";
import { ScrollArea } from "../ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { Restaurant } from "@/types/restaurant.type";

interface RestaurantDetailModalProps {
  initRestaurant: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

function generateRandomString() {
  const timestamp = Date.now().toString(16);
  const random = Math.floor(Math.random() * 1e16).toString(16);
  return `${timestamp}-${random}`;
}

export function RestaurantDetailModal({
  initRestaurant,
  isOpen,
  onClose,
  onSave,
}: RestaurantDetailModalProps) {
  const [notes, setNotes] = useState("");
  const [newActivity, setNewActivity] = useState("");
  const [activityType, setActivityType] = useState("contact");
  const [restaurant, setRestaurant] = useState(initRestaurant);
  const [status, setStatus] = useState("prospect");
  const { user } = useAuth();

  useEffect(() => {
    setRestaurant(initRestaurant);
    setStatus(initRestaurant?.leadStatus.name.toLowerCase() || "prospect");
  }, [initRestaurant]);

  if (!restaurant) return null;

  const getStatusBadge = (status: string) => {
    const variants = {
      prospect: "bg-blue-100 text-blue-800 border-blue-200",
      contacted: "bg-yellow-100 text-yellow-800 border-yellow-200",
      closed: "bg-green-100 text-green-800 border-green-200",
    };
    return variants[status as keyof typeof variants] || variants.prospect;
  };

  const handleAddActivity = async () => {
    if (!newActivity.trim() || !restaurant) return;

    setRestaurant((prev: Restaurant | null) => {
      if (!prev) return null;
      return {
        ...prev,
        leadActivity: [
          {
            activity: newActivity,
            createdAt: new Date(),
            description: "",
            id: `${generateRandomString()}-new-activity`,
            type: activityType,
            user: {
              id: user.id,
              name: user.name,
            },
          },
          ...prev.leadActivity,
        ],
      };
    });

    setNewActivity("");
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "contact":
        return <Phone className="h-4 w-4 text-blue-500" />;
      case "email":
        return <Mail className="h-4 w-4 text-green-500" />;
      case "meeting":
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case "status":
        return <User className="h-4 w-4 text-orange-500" />;
      case "note":
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const handleSaveButton = async () => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_URL}/api/restaurant`, {
        leadId: restaurant.id,
        status: status.charAt(0).toUpperCase() + status.slice(1),
      });
      restaurant.leadActivity.forEach(async (activity) => {
        if (activity.id.endsWith("-new-activity")) {
          await axios.post(
            `${process.env.NEXT_PUBLIC_URL}/api/restaurant/activity`,
            {
              userId: user.id,
              restaurantId: restaurant.id,
              activities: activity.activity,
              type: activity.type,
              description: activity.description,
            }
          );
        }
      });
      if (notes && notes !== "") {
        await axios.post(
          `${process.env.NEXT_PUBLIC_URL}/api/restaurant/notes`,
          {
            userId: user.id,
            restaurantId: restaurant.id,
            notes: notes,
          }
        );
      }
      toast.success("Success to save changes");
      onSave();
    } catch (error) {
      toast.error("Failed while save changes");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {restaurant.name}
            <Badge className={getStatusBadge(status)}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Manage restaurant details and track all interactions
          </DialogDescription>
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
                <Label className="text-sm font-medium text-muted-foreground">
                  Address
                </Label>
                <p className="text-sm mt-1">{restaurant.address}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Phone
                </Label>
                <p className="text-sm mt-1">{restaurant.phone}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Rating
                </Label>
                <div className="flex items-center mt-1">
                  <span className="text-yellow-500 mr-1">★</span>
                  <span className="text-sm">{restaurant.rating}</span>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Website
                </Label>
                <p className="text-sm text-primary mt-1">
                  {restaurant.company.website}
                </p>
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
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Describe the activity..."
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  className="flex-1 bg-input"
                />
                <Button
                  onClick={handleAddActivity}
                  className="bg-primary hover:bg-primary/90"
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Activity Timeline</h3>
              <ScrollArea className="h-72 w-full">
                <div className="space-y-4">
                  {restaurant.leadActivity.map((activity: LeadActivity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3 p-3 bg-card rounded-lg border border-border"
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getActivityIcon(activity.type || "email")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            {activity.activity}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <span>
                              {new Date(activity.createdAt).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              )}
                            </span>
                            <span>
                              {new Date(activity.createdAt).toLocaleDateString(
                                "en-CA"
                              )}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          by {activity.user.name}
                        </p>

                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.description}
                        </p>
                      </div>
                    </div>
                  ))}
                  {restaurant.leadActivity.length < 1 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 mb-4 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 17v-2h6v2m-7-8h8M5 7h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 
        2 0 01-2-2V9a2 2 0 012-2z"
                        />
                      </svg>
                      <p className="text-lg font-medium">Activity Is Empty</p>
                      <p className="text-sm text-gray-400">
                        Your Activity Data Will Display There
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
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
                <ScrollArea className="h-72 w-full">
                  <div className="space-y-2">
                    {restaurant.leadNotes.map((note: LeadNote) => (
                      <div key={note.id} className="p-3 bg-muted rounded-lg">
                        <p className="text-sm">{note.notes}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Added on{" "}
                          {new Date(note.createdAt).toLocaleDateString("en-CA")}{" "}
                          by {note.user.name}
                        </p>
                      </div>
                    ))}
                    {restaurant.leadNotes.length < 1 && (
                      <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 mb-4 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 17v-2h6v2m-7-8h8M5 7h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 
        2 0 01-2-2V9a2 2 0 012-2z"
                          />
                        </svg>
                        <p className="text-lg font-medium">Notes Is Empty</p>
                        <p className="text-sm text-gray-400">
                          Your Notes Data Will Display There
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={handleSaveButton}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
