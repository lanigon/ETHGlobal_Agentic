"use client"

import * as React from "react"
import { useEffect, useState } from 'react';
import { 
  Search,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  MoreVertical,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { EventBus } from '@/game/EventBus';

interface Mail {
  id: string
  name: string
  subject: string
  message: string
  date: string
  read: boolean
  labels: string[]
  thread?: Mail[] // Array of related emails
}

const mails: Mail[] = [
  {
    id: "1",
    name: "William Smith",
    subject: "Meeting Tomorrow",
    message: "Hi, let's have a meeting tomorrow to discuss the project. I've been reviewing the project details and have some ideas I'd like to share. It's crucial that we align on the next steps and timeline. I've also prepared some preliminary mockups that I think will help guide our discussion.\n\nI've noticed a few areas where we could potentially optimize our approach, and I'd love to get your thoughts on these. The main points I'd like to cover are:\n\n1. Current project status\n2. Resource allocation\n3. Timeline adjustments\n4. Risk assessment\n\nPlease let me know if you'd like to add any other topics to the agenda.",
    date: "over 1 year ago",
    read: false,
    labels: ["meeting", "work", "important"],
    thread: [
      {
        id: "1-1",
        name: "You",
        subject: "Re: Meeting Tomorrow",
        message: "Sure, that works for me. What time were you thinking? I have a few items I'd like to add to the agenda as well:\n\n- Budget considerations for Q4\n- Team capacity planning\n- Upcoming milestones\n\nI've also been working on some projections that might be relevant to our discussion. Should I prepare a brief presentation with these details?",
        date: "over 1 year ago",
        read: true,
        labels: ["meeting"]
      },
      {
        id: "1-2",
        name: "William Smith",
        subject: "Re: Meeting Tomorrow",
        message: "How about 10 AM? We can use the main conference room. Those additional agenda items look good. Yes, please prepare the presentation – it would be very helpful to have those projections handy.\n\nI'll make sure to book the room for 2 hours so we have enough time to cover everything thoroughly. I'll also invite Sarah from the design team as some of the discussion points might need her input.\n\nBefore the meeting, could you please review the latest requirements document I shared last week? There are a few updates that might impact our planning.",
        date: "over 1 year ago",
        read: true,
        labels: ["meeting"]
      },
      {
        id: "1-3",
        name: "You",
        subject: "Re: Meeting Tomorrow",
        message: "Perfect, 10 AM works great. I'll review the requirements doc today and come prepared with any questions.\n\nI think having Sarah join is a good idea. I've been meaning to discuss some UI/UX considerations with her anyway.\n\nI'll have the presentation ready with:\n- Current progress metrics\n- Resource utilization charts\n- Projected timelines\n- Budget breakdown\n\nSee you tomorrow at 10!",
        date: "over 1 year ago",
        read: true,
        labels: ["meeting"]
      },
      {
        id: "1-4",
        name: "William Smith",
        subject: "Re: Meeting Tomorrow",
        message: "Excellent! I've just sent out the calendar invite with all the details. I've also attached the latest version of the requirements document for easy reference.\n\nOne more thing – I just heard from the client that they might have some additional requirements. Nothing major, but we should probably allocate some time to discuss potential impacts on our current plan.\n\nI'll prepare a brief overview of their requests for tomorrow's discussion. Looking forward to our meeting!\n\nBest regards,\nWilliam",
        date: "over 1 year ago",
        read: true,
        labels: ["meeting"]
      },
      {
        id: "1-5",
        name: "Sarah Wilson",
        subject: "Re: Meeting Tomorrow",
        message: "Thanks for including me in tomorrow's meeting. I've been working on some design iterations that I think will address the concerns raised in our last review.\n\nI'll prepare a quick walkthrough of:\n- Updated user flows\n- New component designs\n- Responsive considerations\n- Accessibility improvements\n\nI've also documented some technical considerations that we should discuss with the development team.\n\nSee you all tomorrow!\n\nBest,\nSarah",
        date: "over 1 year ago",
        read: true,
        labels: ["meeting", "design"]
      }
    ]
  },
  {
    id: "2",
    name: "Alice Smith",
    subject: "Re: Project Update",
    message: "Thank you for the project update. It looks great! I've gone through the report, and the progress is impressive. The team has done a fantastic job, and I appreciate the hard work everyone has put in.\n\nI have a few minor suggestions that I'll include in the attached document.\n\nLet's discuss these during our next meeting. Keep up the excellent work!\n\nBest regards, Alice",
    date: "Oct 22, 2023, 10:30:00 AM",
    read: true,
    labels: ["work", "important"],
    thread: [
      {
        id: "2-1",
        name: "You",
        subject: "Project Update",
        message: "Hi Alice,\n\nHere's the latest project update you requested. We've made significant progress in the last sprint.",
        date: "Oct 22, 2023, 9:00:00 AM",
        read: true,
        labels: ["work"]
      },
      {
        id: "2-2",
        name: "Alice Smith",
        subject: "Re: Project Update",
        message: "Thank you for the project update. It looks great! I've gone through the report...",
        date: "Oct 22, 2023, 10:30:00 AM",
        read: true,
        labels: ["work", "important"]
      }
    ]
  },
  {
    id: "3",
    name: "Bob Johnson",
    subject: "Weekend Plans",
    message: "Any plans for the weekend? I was thinking of going hiking in the nearby mountains. It's been a while since we had some outdoor fun. If you're...",
    date: "almost 2 years ago",
    read: true,
    labels: ["personal"]
  },
  {
    id: "4",
    name: "Sarah Wilson",
    subject: "Design Review",
    message: "The latest design mockups are ready for review. I've incorporated the feedback from last week's meeting...",
    date: "2 days ago",
    read: false,
    labels: ["design", "work"],
  },
  {
    id: "5",
    name: "David Lee",
    subject: "Team Building Event",
    message: "Hey everyone! I'm organizing a team building event next month. Please fill out the survey with your preferences...",
    date: "3 days ago",
    read: true,
    labels: ["team", "social"],
  },
  {
    id: "6",
    name: "Emma Davis",
    subject: "Client Presentation Feedback",
    message: "Great job on the client presentation yesterday! The client was very impressed with our proposal...",
    date: "4 days ago",
    read: true,
    labels: ["client", "work", "important"],
  },
  {
    id: "7",
    name: "Michael Brown",
    subject: "Budget Review Q4",
    message: "Please review the attached Q4 budget projections. We need to finalize this by end of week...",
    date: "5 days ago",
    read: true,
    labels: ["finance", "work"],
  },
  {
    id: "8",
    name: "Lisa Anderson",
    subject: "New Project Kickoff",
    message: "Exciting news! We're starting a new project next week. I'd like to schedule a kickoff meeting...",
    date: "1 week ago",
    read: true,
    labels: ["project", "work"],
  },
  {
    id: "9",
    name: "James Wilson",
    subject: "Holiday Party Planning",
    message: "It's that time of year again! We're starting to plan the annual holiday party...",
    date: "1 week ago",
    read: true,
    labels: ["social", "team"],
  },
  {
    id: "10",
    name: "Rachel Green",
    subject: "Website Updates",
    message: "The new website features are ready for testing. Please review and provide feedback by Friday...",
    date: "2 weeks ago",
    read: true,
    labels: ["development", "work"],
  },
  {
    id: "11",
    name: "Tom Harris",
    subject: "Training Session",
    message: "Just a reminder about tomorrow's training session. Please bring your laptops...",
    date: "2 weeks ago",
    read: true,
    labels: ["training", "work"],
  },
  {
    id: "12",
    name: "Julia Roberts",
    subject: "Marketing Strategy",
    message: "Here's the draft of our Q1 marketing strategy. Looking forward to your input...",
    date: "3 weeks ago",
    read: true,
    labels: ["marketing", "work"],
  },
  {
    id: "13",
    name: "Kevin Chen",
    subject: "Code Review Request",
    message: "Could you review my latest PR when you have a chance? It includes the new authentication features...",
    date: "3 weeks ago",
    read: true,
    labels: ["development", "work"],
  },
  {
    id: "14",
    name: "Anna White",
    subject: "Office Supply Order",
    message: "I'm placing an office supply order. Let me know if you need anything specific...",
    date: "1 month ago",
    read: true,
    labels: ["office", "work"],
  },
  {
    id: "15",
    name: "Peter Parker",
    subject: "Photo Assignment",
    message: "Here are the photos from yesterday's event. Let me know which ones you'd like to use...",
    date: "1 month ago",
    read: true,
    labels: ["media", "work"],
  }
]

export function Mail({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const [selectedMail, setSelectedMail] = React.useState<Mail | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isDriftBottle, setIsDriftBottle] = useState<boolean>(false);

  // Filter emails based on search query
  const filteredMails = React.useMemo(() => {
    if (!searchQuery) return mails
    
    const query = searchQuery.toLowerCase()
    return mails.filter((mail) => 
      mail.subject.toLowerCase().includes(query) ||
      mail.message.toLowerCase().includes(query) ||
      mail.name.toLowerCase().includes(query) ||
      mail.labels.some(label => label.toLowerCase().includes(query))
    )
  }, [searchQuery])

  useEffect(() => {
    const handleSwitchScene = () => {
        setIsDriftBottle((prev) => !prev);
    }

    EventBus.on('switch-driftbottle-scene', handleSwitchScene); 

    return () => {
      EventBus.removeListener('switch-driftbottle-scene');
    };
}, []);

  const handleClose = () => {
    EventBus.emit('switch-driftbottle-scene');
    EventBus.emit('close-mail');
  };

  if (!isDriftBottle) return null;
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className={cn(
        "bg-zinc-900 rounded-xl w-[90%] max-w-6xl h-[90vh] flex flex-col relative border border-zinc-800 shadow-2xl",
        className
      )}>
        {/* Close button */}
        <button 
          onClick={handleClose}
          className="absolute right-4 top-4 p-2 hover:bg-zinc-800 rounded-full transition-colors"
        >
          <X className="h-4 w-4 text-zinc-400 hover:text-zinc-100" />
        </button>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-zinc-100">Inbox</h1>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-zinc-800">
                <ArrowLeft className="h-4 w-4 text-zinc-400" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-zinc-800">
                <ArrowRight className="h-4 w-4 text-zinc-400" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-zinc-800">
                <RotateCcw className="h-4 w-4 text-zinc-400" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Message List */}
          <div className="w-[400px] border-r border-zinc-800">
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <input
                  placeholder="Search emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 pl-9 pr-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                />
              </div>
            </div>
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <div className="px-4 space-y-2">
                {filteredMails.map((mail) => (
                  <div
                    key={mail.id}
                    className={cn(
                      "cursor-pointer space-y-2 rounded-lg p-3 transition-colors",
                      selectedMail?.id === mail.id ? "bg-zinc-800" : "hover:bg-zinc-800/50",
                      !mail.read && "font-medium"
                    )}
                    onClick={() => setSelectedMail(mail)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <h4 className="font-medium leading-none text-zinc-100">{mail.name}</h4>
                        <p className="text-sm text-zinc-400">{mail.subject}</p>
                      </div>
                      <div className="text-xs text-zinc-500">
                        {mail.date}
                      </div>
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-2">
                      {mail.message}
                    </p>
                    <div className="flex gap-2">
                      {mail.labels.map((label) => (
                        <span
                          key={label}
                          className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Message Content */}
          {selectedMail ? (
            <ScrollArea className="flex-1 bg-zinc-900">
              <div className="p-8">
                <div className="mx-auto max-w-3xl">
                  <Accordion type="single" collapsible className="space-y-4">
                    <AccordionItem key={selectedMail.id} value={selectedMail.id} className="border-zinc-800">
                      <AccordionTrigger className="flex gap-4 text-left hover:bg-zinc-800 rounded-lg px-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-zinc-100">{selectedMail.subject}</h3>
                            <span className="text-sm text-zinc-500">
                              {selectedMail.date}
                            </span>
                          </div>
                          <div className="text-sm text-zinc-400">
                            From: {selectedMail.name}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-zinc-300 px-4">
                        <div className="pt-4 text-sm">
                          <div className="whitespace-pre-wrap">{selectedMail.message}</div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            </ScrollArea>
          ) : (
            <div className="flex h-full items-center justify-center bg-zinc-900">
              <p className="text-zinc-500">Select a message to read</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 