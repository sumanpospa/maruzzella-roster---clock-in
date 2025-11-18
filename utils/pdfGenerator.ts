import jsPDF from 'jspdf';
import { DayOfWeek, Roster, Employee } from '../types';

export const generateRosterPDF = (
  roster: Roster,
  employees: Employee[],
  weekLabel: string,
  dates: Date[]
): string => {
  const pdf = new jsPDF('l', 'mm', 'a4'); // landscape orientation
  
  const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Title
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Staff Roster - Maruzzella', 148, 15, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(weekLabel, 148, 22, { align: 'center' });
  
  // Table setup
  const startY = 30;
  const startX = 10;
  const rowHeight = 12;
  const colWidth = 38;
  const nameColWidth = 40;
  
  // Header row
  pdf.setFillColor(240, 240, 240);
  pdf.rect(startX, startY, nameColWidth, rowHeight, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text('Employee', startX + 2, startY + 8);
  
  days.forEach((day, i) => {
    const x = startX + nameColWidth + (i * colWidth);
    pdf.rect(x, startY, colWidth, rowHeight, 'F');
    const dateStr = dates[i].toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    pdf.text(`${day.substring(0, 3)}`, x + 2, startY + 5);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(dateStr, x + 2, startY + 9);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
  });
  
  // Employee rows
  let currentY = startY + rowHeight;
  
  employees.forEach((employee, index) => {
    if (currentY > 180) { // New page if needed
      pdf.addPage();
      currentY = 20;
    }
    
    // Alternating row colors
    if (index % 2 === 0) {
      pdf.setFillColor(250, 250, 250);
      pdf.rect(startX, currentY, nameColWidth + (7 * colWidth), rowHeight, 'F');
    }
    
    // Employee name
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.text(employee.name, startX + 2, currentY + 8);
    
    // Shifts for each day
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    
    days.forEach((day, i) => {
      const x = startX + nameColWidth + (i * colWidth);
      const employeeShifts = roster[day]?.filter(s => s.employeeIds.includes(employee.id)) || [];
      
      if (employeeShifts.length > 0) {
        const shiftTexts = employeeShifts.map(shift => {
          const timeStr = (shift.startTime && shift.endTime) 
            ? `${shift.startTime}-${shift.endTime}` 
            : 'TBD';
          return shift.notes ? `${timeStr} (${shift.notes})` : timeStr;
        });
        
        let yOffset = 0;
        shiftTexts.forEach((text, idx) => {
          pdf.text(text, x + 2, currentY + 5 + yOffset);
          yOffset += 4;
        });
      } else {
        pdf.setTextColor(180, 180, 180);
        pdf.text('-', x + 2, currentY + 8);
        pdf.setTextColor(0, 0, 0);
      }
    });
    
    currentY += rowHeight;
  });
  
  // Border around table
  pdf.setDrawColor(200, 200, 200);
  pdf.rect(startX, startY, nameColWidth + (7 * colWidth), currentY - startY);
  
  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  const footerText = `Generated on ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
  pdf.text(footerText, 148, 200, { align: 'center' });
  
  // Return as base64 data URL
  return pdf.output('dataurlstring');
};
