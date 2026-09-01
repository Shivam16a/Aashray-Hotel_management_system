// src/utils/generateInvoicePDF.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

export const generateBookingInvoicePDF = async (booking, user) => {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    const primaryColor = [0, 240, 255]; // #00f0ff Cyan
    const darkBg = [6, 9, 19]; // #060913
    const textLight = [255, 255, 255];
    const textDim = [148, 163, 184];

    // 1. Header Dark Banner
    doc.setFillColor(...darkBg);
    doc.rect(0, 0, 210, 45, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(...primaryColor);
    doc.text("AASHRAY STAYS & SANCTUARIES", 14, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textDim);
    doc.text("Cryptographic Hospitality & Sanctuary Network", 14, 27);
    doc.text("GSTIN: 27AAACA1234A1Z5 • 24/7 Concierge Support", 14, 33);

    // Document Title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text("TAX INVOICE / VOUCHER", 140, 20);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textLight);
    doc.text(`Invoice No: INV-${booking._id.slice(-8).toUpperCase()}`, 140, 27);
    doc.text(`Date: ${new Date(booking.createdAt || Date.now()).toLocaleDateString()}`, 140, 33);

    // 2. Guest & Reservation Information Box
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 52, 196, 52);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("GUEST DETAILS", 14, 60);
    doc.text("RESERVATION SUMMARY", 110, 60);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);

    // Guest Info
    doc.text(`Name: ${user?.username || "Verified Guest"}`, 14, 67);
    doc.text(`Email: ${user?.email || "N/A"}`, 14, 73);
    doc.text(`Contact: ${user?.phone || "N/A"}`, 14, 79);

    // Reservation Info
    doc.text(`Property: ${booking.hotel?.name || "Sanctuary Stay"}`, 110, 67);
    doc.text(`Location: ${booking.hotel?.location || "India"}`, 110, 73);
    doc.text(`Check-In: ${new Date(booking.checkInDate).toDateString()}`, 110, 79);
    doc.text(`Check-Out: ${new Date(booking.checkOutDate).toDateString()}`, 110, 85);
    doc.text(`Stay Duration: ${booking.totalNights || 1} Night(s)`, 110, 91);
    doc.text(`Guests Count: ${booking.guestsCount || 1} Guest(s)`, 110, 97);

    // 3. Billing & Tax Breakdown Table
    const roomRate = booking.hotel?.pricePerNight || Math.round(booking.totalPrice / (booking.totalNights || 1));
    const baseTotal = roomRate * (booking.totalNights || 1);
    const gstRate = 0.18; // 18% GST standard hospitality
    const netBaseAmount = Math.round(baseTotal / (1 + gstRate));
    const totalGst = baseTotal - netBaseAmount;
    const cgst = (totalGst / 2).toFixed(2);
    const sgst = (totalGst / 2).toFixed(2);

    autoTable(doc, {
        startY: 106,
        head: [["Description", "Rate / Night", "Nights", "Total Base", "CGST (9%)", "SGST (9%)", "Net Amount"]],
        body: [
            [
                `${booking.hotel?.name} Accommodation`,
                `INR ${roomRate}`,
                `${booking.totalNights || 1}`,
                `INR ${netBaseAmount}`,
                `INR ${cgst}`,
                `INR ${sgst}`,
                `INR ${booking.totalPrice}`,
            ],
        ],
        theme: "grid",
        headStyles: {
            fillColor: [6, 9, 19],
            textColor: [0, 240, 255],
            fontStyle: "bold",
        },
        styles: {
            fontSize: 8.5,
            cellPadding: 4,
        },
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    // 4. Grand Total Box
    doc.setFillColor(241, 245, 249);
    doc.rect(120, finalY, 76, 25, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text("Total Paid (All Inclusive):", 124, finalY + 8);
    doc.setFontSize(14);
    doc.setTextColor(16, 185, 129); // Green
    doc.text(`INR ${booking.totalPrice?.toLocaleString()}`, 124, finalY + 18);

    // 5. QR Code & Departure Pass Box
    const qrText = `AASHRAY-VOUCHER|ID:${booking._id}|CODE:${booking.checkoutCode}|HOTEL:${booking.hotel?.name}|PAID:${booking.totalPrice}`;
    try {
        const qrDataUrl = await QRCode.toDataURL(qrText, { margin: 1, width: 120 });
        doc.addImage(qrDataUrl, "PNG", 14, finalY, 28, 28);
    } catch (e) {
        console.error("QR Code Error:", e);
    }

    // Departure Pass Frame
    doc.setDrawColor(0, 240, 255);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(46, finalY, 68, 28, 2, 2, "FD");

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text("CHECKOUT SECURITY PASS", 50, finalY + 7);

    doc.setFontSize(14);
    doc.setFont("courier", "bold");
    doc.setTextColor(2, 132, 199);
    doc.text(booking.checkoutCode || "ASH-7701", 50, finalY + 16);

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(217, 119, 6);
    doc.text("Show this pass at property departure", 50, finalY + 23);

    // 6. Terms & Footer
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text("Terms & Stay Guidelines:", 14, finalY + 38);
    doc.text("• Standard Check-in is 14:00 hrs and Check-out is 11:00 hrs.", 14, finalY + 43);
    doc.text("• Free cancellation is applicable up to 24 hours before check-in date.", 14, finalY + 47);
    doc.text("• Valid Government photo identification is mandatory for all registered guests upon arrival.", 14, finalY + 51);

    // Save File
    doc.save(`Aashray_Voucher_${booking.checkoutCode || booking._id.slice(-6)}.pdf`);
};