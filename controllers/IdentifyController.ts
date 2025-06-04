import { Request, Response } from "express";
import prisma from "../prismaClient";

export const identify = async (req: Request, res: Response) => {
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    return res.status(400).json({ error: "Provide at least email or phoneNumber" });
  }

  try {
    // Step 1: Find all related contacts
    const contacts = await prisma.contact.findMany({
      where: {
        OR: [
          email ? { email } : undefined,
          phoneNumber ? { phoneNumber } : undefined
        ].filter(Boolean) as any,
      },
      orderBy: { createdAt: "asc" },
    });

    // Step 2: Collect all related contacts (recursively)
    let relatedContacts = [...contacts];

    if (contacts.length > 0) {
      const primaryIds = contacts.map(c => c.linkPrecedence === "primary" ? c.id : c.linkedId).filter(Boolean);
      const primaryId = Math.min(...(primaryIds as number[]));

      const allLinked = await prisma.contact.findMany({
        where: {
          OR: [
            { id: primaryId },
            { linkedId: primaryId }
          ]
        },
        orderBy: { createdAt: "asc" }
      });

      relatedContacts = allLinked;
    }

    // Step 3: Determine the current primary contact
    const primaryContact = relatedContacts.find(c => c.linkPrecedence === "primary") || relatedContacts[0];

    // Step 4: Check if email or phoneNumber is new
    const emailExists = relatedContacts.some(c => c.email === email);
    const phoneExists = relatedContacts.some(c => c.phoneNumber === phoneNumber);

    let newSecondary = null;

    if (!(emailExists && phoneExists)) {
      // Create a new secondary contact with missing data
      newSecondary = await prisma.contact.create({
        data: {
          email,
          phoneNumber,
          linkedId: primaryContact.id,
          linkPrecedence: "secondary"
        }
      });
      relatedContacts.push(newSecondary);
    }

    // Step 5: Ensure only one primary contact
    const allPrimaries = relatedContacts.filter(c => c.linkPrecedence === "primary");

    const truePrimary = allPrimaries.reduce((a, b) => a.createdAt < b.createdAt ? a : b);

    for (const contact of allPrimaries) {
      if (contact.id !== truePrimary.id) {
        await prisma.contact.update({
          where: { id: contact.id },
          data: {
            linkPrecedence: "secondary",
            linkedId: truePrimary.id
          }
        });
      }
    }

    // Step 6: Build response
    const finalContacts = await prisma.contact.findMany({
      where: {
        OR: [
          { id: truePrimary.id },
          { linkedId: truePrimary.id }
        ]
      },
      orderBy: { createdAt: "asc" }
    });

    const emails = Array.from(new Set(finalContacts.map(c => c.email).filter(Boolean)));
    const phoneNumbers = Array.from(new Set(finalContacts.map(c => c.phoneNumber).filter(Boolean)));
    const secondaryContactIds = finalContacts
      .filter(c => c.linkPrecedence === "secondary")
      .map(c => c.id);

    return res.status(200).json({
      contact: {
        primaryContactId: truePrimary.id,
        emails,
        phoneNumbers,
        secondaryContactIds
      }
    });

  } catch (err) {
    console.error("Error identifying contact:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
