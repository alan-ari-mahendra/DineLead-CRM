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
  Sparkles,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import { LeadActivity, LeadNote } from "@/types/restaurant.type";
import { ScrollArea } from "../ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { Restaurant } from "@/types/restaurant.type";

interface RestaurantDetailModalProps {
  initRestaurant: Restaurant | null;
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

  // AI Email Generator state
  const [aiTone, setAiTone] = useState<"professional" | "friendly" | "casual">(
    "professional"
  );
  const [aiLanguage, setAiLanguage] = useState<"id" | "en">("id");
  const [aiSubject, setAiSubject] = useState("");
  const [aiBody, setAiBody] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCopied, setAiCopied] = useState<"subject" | "body" | "all" | null>(
    null
  );

  const handleGenerateEmail = async () => {
    if (!restaurant) return;
    setAiLoading(true);
    try {
      const res = await axios.post(`/api/ai/generate-email`, {
        leadId: restaurant.id,
        tone: aiTone,
        language: aiLanguage,
      });
      setAiSubject(res.data.subject || "");
      setAiBody(res.data.body || "");
      toast.success("Email generated successfully");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data
              ?.error
          : "Failed to generate email";
      toast.error(message || "Failed to generate email");
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopy = async (text: string, key: "subject" | "body" | "all") => {
    try {
      await navigator.clipboard.writeText(text);
      setAiCopied(key);
      setTimeout(() => setAiCopied(null), 1500);
    } catch {
      toast.error("Failed to copy");
    }
  };

  useEffect(() => {
    setRestaurant(initRestaurant);
    setStatus(initRestaurant?.leadStatus.name.toLowerCase() || "prospect");
    // Reset AI email state when switching restaurants
    setAiSubject("");
    setAiBody("");
    setAiCopied(null);
    setNotes("");
    setNewActivity("");
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
    if (!user?.id) {
      toast.error("Session not ready");
      return;
    }

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
              id: user.id ?? "",
              name: user.name ?? "",
              email: user.email ?? "",
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
    if (!user?.id) {
      toast.error("Session not ready");
      return;
    }
    try {
      await axios.put(`/api/restaurant`, {
        leadId: restaurant.id,
        status: status.charAt(0).toUpperCase() + status.slice(1),
      });

      // Sequential to surface errors clearly
      const newActivities = restaurant.leadActivity.filter((a) =>
        a.id.endsWith("-new-activity")
      );
      for (const activity of newActivities) {
        await axios.post(`/api/restaurant/activity`, {
          restaurantId: restaurant.id,
          activities: activity.activity,
          type: activity.type,
          description: activity.description,
        });
      }

      if (notes && notes !== "") {
        await axios.post(`/api/restaurant/notes`, {
          restaurantId: restaurant.id,
          notes: notes,
        });
      }
      toast.success("Success to save changes");
      onSave();
    } catch {
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="ai-email">
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              AI Email
            </TabsTrigger>
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
                  {restaurant.company?.website && restaurant.company.website !== "-"
                    ? restaurant.company.website
                    : "-"}
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

          <TabsContent value="ai-email" className="space-y-4">
            <div className="space-y-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">
                  AI Outreach Email Generator
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Generate a personalized cold outreach email for{" "}
                <span className="font-medium">{restaurant.name}</span> powered by
                Groq AI.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Tone</Label>
                  <Select
                    value={aiTone}
                    onValueChange={(v) =>
                      setAiTone(v as "professional" | "friendly" | "casual")
                    }
                  >
                    <SelectTrigger className="bg-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Language</Label>
                  <Select
                    value={aiLanguage}
                    onValueChange={(v) => setAiLanguage(v as "id" | "en")}
                  >
                    <SelectTrigger className="bg-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="id">Bahasa Indonesia</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleGenerateEmail}
                disabled={aiLoading}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {aiSubject ? "Regenerate Email" : "Generate Email"}
                  </>
                )}
              </Button>
            </div>

            {(aiSubject || aiBody) && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Subject</Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopy(aiSubject, "subject")}
                      className="h-7 px-2"
                    >
                      {aiCopied === "subject" ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                  <Input
                    value={aiSubject}
                    onChange={(e) => setAiSubject(e.target.value)}
                    className="bg-input"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Body</Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopy(aiBody, "body")}
                      className="h-7 px-2"
                    >
                      {aiCopied === "body" ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                  <Textarea
                    value={aiBody}
                    onChange={(e) => setAiBody(e.target.value)}
                    className="min-h-[220px] bg-input font-mono text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() =>
                      handleCopy(`Subject: ${aiSubject}\n\n${aiBody}`, "all")
                    }
                  >
                    {aiCopied === "all" ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Full Email
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      const mailto = `mailto:${restaurant.email || ""}?subject=${encodeURIComponent(
                        aiSubject
                      )}&body=${encodeURIComponent(aiBody)}`;
                      window.location.href = mailto;
                    }}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Open in Mail
                  </Button>
                </div>
              </div>
            )}

            {!aiSubject && !aiBody && !aiLoading && (
              <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500 border border-dashed rounded-lg">
                <Sparkles className="h-12 w-12 mb-4 text-gray-400" />
                <p className="text-lg font-medium">No Email Generated Yet</p>
                <p className="text-sm text-gray-400 max-w-sm">
                  Choose your preferred tone and language, then click Generate
                  Email to let AI craft a personalized outreach for you.
                </p>
              </div>
            )}
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
