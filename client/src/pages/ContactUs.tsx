import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Send,
  Clock,
  MessageSquare
} from "lucide-react";

export default function ContactUs() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Message Sent",
      description: "Thank you for contacting us. We'll get back to you soon!",
    });
    
    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b-2 border-black bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <ArrowLeft className="h-5 w-5" />
                <span className="font-bold text-xl text-black">eSlate</span>
              </div>
            </Link>
            <Link href="/auth">
              <Button className="bg-black text-white hover:bg-gray-800 border-2 border-black">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions about eSlate? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="border-2 border-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Smith"
                        required
                        className="border-2 border-gray-300 focus:border-black"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        required
                        className="border-2 border-gray-300 focus:border-black"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help?"
                      required
                      className="border-2 border-gray-300 focus:border-black"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us more about your enquiry..."
                      rows={6}
                      required
                      className="border-2 border-gray-300 focus:border-black resize-none"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-black text-white hover:bg-gray-800 border-2 border-black py-6 text-lg"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="h-5 w-5" />
                        Send Message
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-2 border-black">
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <Mail className="h-5 w-5 text-black" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black">Email</h3>
                      <p className="text-gray-600">support@eslate.edu</p>
                      <p className="text-gray-600">sales@eslate.edu</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <Phone className="h-5 w-5 text-black" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black">Phone</h3>
                      <p className="text-gray-600">+44 (0) 20 1234 5678</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <MapPin className="h-5 w-5 text-black" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black">Address</h3>
                      <p className="text-gray-600">
                        123 Education Street<br />
                        London, EC1A 1BB<br />
                        United Kingdom
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <Clock className="h-5 w-5 text-black" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black">Business Hours</h3>
                      <p className="text-gray-600">Monday - Friday</p>
                      <p className="text-gray-600">9:00 AM - 6:00 PM GMT</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-black bg-gray-50">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-black mb-2">Quick Response</h3>
                <p className="text-gray-600 text-sm">
                  We aim to respond to all enquiries within 24 hours during business days. For urgent matters, please call us directly.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t-2 border-black bg-white mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 text-sm">
              &copy; {new Date().getFullYear()} eSlate. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/legal/privacy">
                <span className="text-gray-600 hover:text-black text-sm cursor-pointer">Privacy Policy</span>
              </Link>
              <Link href="/legal/terms">
                <span className="text-gray-600 hover:text-black text-sm cursor-pointer">Terms of Service</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
