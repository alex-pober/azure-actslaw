import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  FolderOpen,
  MessageCircle,
  Clock,
  TrendingUp,
  ExternalLink,
  Send,
  Calendar,
  User,
  Building2,
  FileText,
  Timer,
  Gift
} from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back to your Dashboard
          </h1>
          <p className="text-slate-600">
            Stay on top of your cases and access important resources
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Recently Accessed Cases */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FolderOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Recently Accessed Cases</CardTitle>
                      <CardDescription>Your most recent case activity</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {/* Case Items */}
                    {[
                      {
                        id: "CASE-2024-001",
                        title: "Johnson vs. Metropolitan Insurance",
                        type: "Personal Injury",
                        lastAccessed: "2 hours ago",
                        status: "Active",
                        priority: "High"
                      },
                      {
                        id: "CASE-2024-002",
                        title: "Smith Family Trust Formation",
                        type: "Estate Planning",
                        lastAccessed: "1 day ago",
                        status: "Review",
                        priority: "Medium"
                      },
                      {
                        id: "CASE-2024-003",
                        title: "ABC Corp Contract Negotiation",
                        type: "Corporate Law",
                        lastAccessed: "3 days ago",
                        status: "Pending",
                        priority: "Low"
                      },
                      {
                        id: "CASE-2024-004",
                        title: "Residential Property Purchase - Davis",
                        type: "Real Estate",
                        lastAccessed: "1 week ago",
                        status: "Completed",
                        priority: "Low"
                      },
                      {
                        id: "CASE-2024-005",
                        title: "Martinez Divorce Proceedings",
                        type: "Family Law",
                        lastAccessed: "2 weeks ago",
                        status: "Active",
                        priority: "High"
                      }
                    ].map((case_item) => (
                      <div key={case_item.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer group">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <FileText className="h-4 w-4 text-slate-500" />
                              <span className="text-sm font-medium text-slate-600">{case_item.id}</span>
                              <Badge
                                variant={case_item.priority === 'High' ? 'destructive' : case_item.priority === 'Medium' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {case_item.priority}
                              </Badge>
                            </div>
                            <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                              {case_item.title}
                            </h4>
                            <div className="flex items-center space-x-4 text-sm text-slate-500">
                              <div className="flex items-center space-x-1">
                                <Building2 className="h-3 w-3" />
                                <span>{case_item.type}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{case_item.lastAccessed}</span>
                              </div>
                            </div>
                          </div>
                          <Badge variant={case_item.status === 'Active' ? 'default' : case_item.status === 'Completed' ? 'secondary' : 'outline'}>
                            {case_item.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <Button className="w-full" variant="outline">
                    <FolderOpen className="h-4 w-4 mr-2" />
                    View All Cases
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* AI HR Chatbot */}
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">AI HR Assistant</CardTitle>
                    <CardDescription>Get instant answers to HR questions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Chat Messages */}
                  <ScrollArea className="h-48 p-3 bg-slate-50 rounded-lg">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <MessageCircle className="h-4 w-4 text-white" />
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm max-w-xs">
                          <p className="text-sm">Hi! I'm your AI HR Assistant. I can help you with questions about policies, benefits, time off, and more. What would you like to know?</p>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>

                  {/* Chat Input */}
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Ask me about HR policies, benefits, time off..."
                      className="flex-1"
                    />
                    <Button size="sm">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Quick Questions */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">Quick Questions:</p>
                    <div className="flex flex-wrap gap-2">
                      {["Time off policy", "Health benefits", "401k info", "Remote work"].map((question) => (
                        <Button key={question} variant="outline" size="sm" className="text-xs">
                          {question}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Access Links */}
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Quick Access</CardTitle>
                    <CardDescription>Essential tools and resources</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {/* Clockin Software (Timeco) */}
                  <div className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-all cursor-pointer group bg-gradient-to-r from-blue-50 to-blue-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-500 rounded-lg">
                          <Timer className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 group-hover:text-blue-600">
                            Clockin Software
                          </h4>
                          <p className="text-sm text-slate-600">Timeco - Track your hours</p>
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
                    </div>
                  </div>

                  {/* Benefits Portal (Amplify) */}
                  <div className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-all cursor-pointer group bg-gradient-to-r from-emerald-50 to-emerald-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-emerald-500 rounded-lg">
                          <Gift className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 group-hover:text-emerald-600">
                            Benefits Portal
                          </h4>
                          <p className="text-sm text-slate-600">Amplify - Manage your benefits</p>
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-emerald-600" />
                    </div>
                  </div>

                  {/* Additional Quick Links */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <Button variant="outline" size="sm" className="h-12 flex-col space-y-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-xs">Calendar</span>
                    </Button>
                    <Button variant="outline" size="sm" className="h-12 flex-col space-y-1">
                      <User className="h-4 w-4" />
                      <span className="text-xs">Directory</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
