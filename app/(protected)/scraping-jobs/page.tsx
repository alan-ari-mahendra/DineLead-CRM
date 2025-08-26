import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap, Clock, CheckCircle, XCircle, Play, MoreHorizontal } from "lucide-react"

export default function ScrapingJobsPage() {
  const jobs = [
    {
      id: 1,
      name: "NYC Italian Restaurants",
      status: "completed",
      location: "New York, NY",
      category: "Italian",
      results: 45,
      startTime: "2024-01-15 10:30 AM",
      duration: "2m 34s",
    },
    {
      id: 2,
      name: "LA Mexican Food",
      status: "running",
      location: "Los Angeles, CA",
      category: "Mexican",
      results: 23,
      startTime: "2024-01-15 11:45 AM",
      duration: "1m 12s",
    },
    {
      id: 3,
      name: "Chicago Pizza Places",
      status: "failed",
      location: "Chicago, IL",
      category: "Pizza",
      results: 0,
      startTime: "2024-01-15 09:15 AM",
      duration: "0m 45s",
    },
    {
      id: 4,
      name: "Miami Seafood",
      status: "pending",
      location: "Miami, FL",
      category: "Seafood",
      results: 0,
      startTime: "Scheduled for 2:00 PM",
      duration: "-",
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "running":
        return <Play className="h-4 w-4 text-blue-600" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "running":
        return "bg-blue-100 text-blue-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Scraping Jobs</h1>
          <p className="text-gray-600">Monitor and manage your data scraping operations.</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
          <Zap className="h-4 w-4 mr-2" />
          New Scraping Job
        </Button>
      </div>

      <div className="grid gap-4">
        {jobs.map((job) => (
          <Card key={job.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(job.status)}
                  <div>
                    <h3 className="font-semibold text-gray-900">{job.name}</h3>
                    <p className="text-sm text-gray-600">
                      {job.location} • {job.category}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Badge className={getStatusColor(job.status)}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </Badge>

                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{job.results} results</p>
                    <p className="text-xs text-gray-500">{job.duration}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-500">Started</p>
                    <p className="text-sm text-gray-900">{job.startTime}</p>
                  </div>

                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
