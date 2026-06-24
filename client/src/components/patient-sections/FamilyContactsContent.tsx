import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Phone } from "lucide-react";
import { getFamilyContactsForPatient } from "@/lib/patientData";

interface FamilyContactsContentProps {
  patientId: string;
}

export default function FamilyContactsContent({ patientId }: FamilyContactsContentProps) {
  const contacts = getFamilyContactsForPatient(patientId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Family Contacts</h2>
        <p className="text-gray-500 text-sm mt-1">Emergency contacts and family members</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.map((contact) => (
          <Card key={contact.id} className="p-5 hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center text-center">
              <Avatar className="w-16 h-16 mb-3">
                <AvatarFallback className="bg-blue-50 text-blue-600 text-lg font-semibold">
                  {contact.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-gray-900">{contact.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{contact.relationship}</p>
              <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-primary" />
                <a href={`tel:${contact.phone}`} className="hover:text-primary transition-colors">
                  {contact.phone}
                </a>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
