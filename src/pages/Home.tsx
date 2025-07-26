import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Scale, Home as HomeIcon, Users } from 'lucide-react'

export default function Home() {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-6">
            Welcome to ACTS Law Firm
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Providing exceptional legal services with integrity, expertise, and dedication. 
            Your trusted partner in navigating complex legal matters.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Scale className="h-5 w-5 text-primary" />
                  <CardTitle>Corporate Law</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>Expert guidance for business legal matters</CardDescription>
                <Badge variant="secondary" className="mt-2">Professional</Badge>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <HomeIcon className="h-5 w-5 text-primary" />
                  <CardTitle>Real Estate</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>Complete property transaction support</CardDescription>
                <Badge variant="secondary" className="mt-2">Residential</Badge>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle>Family Law</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>Compassionate family legal services</CardDescription>
                <Badge variant="secondary" className="mt-2">Personal</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }