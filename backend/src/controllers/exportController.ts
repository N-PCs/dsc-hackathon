import { Request, Response } from 'express';
import { getAllTeams } from '../services/teamService.js';
import ExcelJS from 'exceljs';

export const exportCsv = async (req: Request, res: Response) => {
  const teams = await getAllTeams();
  const headers = [
    'Team ID', 'Team Name', 'Track', 'Access Code', 'Payment Status', 'Amount Paid (₹)',
    'Transaction Ref', 'Registered At', 'Checked In Venue',
    'Leader Name', 'Leader Email', 'Leader Phone', 'Leader Reg No', 'Leader Status', 'Leader Mess',
    'Member 2 Name', 'Member 2 Email', 'Member 2 Reg No', 'Member 2 Status', 'Member 2 Mess',
    'Member 3 Name', 'Member 3 Email', 'Member 3 Reg No', 'Member 3 Status', 'Member 3 Mess',
    'Member 4 Name', 'Member 4 Email', 'Member 4 Reg No', 'Member 4 Status', 'Member 4 Mess',
    'Member 5 Name', 'Member 5 Email', 'Member 5 Reg No', 'Member 5 Status', 'Member 5 Mess',
    'Project Title', 'Project GitHub', 'Project Presentation (PPT/PDF)', 'Total Score',
  ];
  const escapeCsv = (val: any) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };
  const rows = teams.map((t) => [
    escapeCsv(t.id), escapeCsv(t.teamName), escapeCsv(t.track), escapeCsv(t.accessCode),
    escapeCsv(t.paymentStatus), escapeCsv(t.amountPaid || 0),
    escapeCsv(t.transactionRef), escapeCsv(t.registeredAt), escapeCsv(t.checkedInVenue ? 'Yes' : 'No'),
    escapeCsv(t.leader.name), escapeCsv(t.leader.email), escapeCsv(t.leader.phone),
    escapeCsv(t.leader.registrationNumber || ''), escapeCsv(t.leader.residentialStatus || ''),
    escapeCsv(t.leader.messName || ''),
    escapeCsv(t.member2?.name || ''), escapeCsv(t.member2?.email || ''),
    escapeCsv(t.member2?.registrationNumber || ''), escapeCsv(t.member2?.residentialStatus || ''),
    escapeCsv(t.member2?.messName || ''),
    escapeCsv(t.member3?.name || ''), escapeCsv(t.member3?.email || ''),
    escapeCsv(t.member3?.registrationNumber || ''), escapeCsv(t.member3?.residentialStatus || ''),
    escapeCsv(t.member3?.messName || ''),
    escapeCsv(t.member4?.name || ''), escapeCsv(t.member4?.email || ''),
    escapeCsv(t.member4?.registrationNumber || ''), escapeCsv(t.member4?.residentialStatus || ''),
    escapeCsv(t.member4?.messName || ''),
    escapeCsv(t.member5?.name || ''), escapeCsv(t.member5?.email || ''),
    escapeCsv(t.member5?.registrationNumber || ''), escapeCsv(t.member5?.residentialStatus || ''),
    escapeCsv(t.member5?.messName || ''),
    escapeCsv(t.project?.title || ''), escapeCsv(t.project?.githubUrl || ''),
    escapeCsv(t.project?.presentationUrl || ''), escapeCsv(t.project?.score?.total || ''),
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="origin-teams-${Date.now()}.csv"`);
  res.send(csv);
};

export const exportExcel = async (req: Request, res: Response) => {
  const teams = await getAllTeams();
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Registrations');

  const data = teams.map((t) => ({
    'Team ID': t.id,
    'Team Name': t.teamName,
    'Track': t.track,
    'Access Code': t.accessCode,
    'Payment Status': t.paymentStatus,
    'Amount Paid (₹)': t.amountPaid || 0,
    'Transaction Ref': t.transactionRef,
    'Registered At': t.registeredAt,
    'Checked In Venue': t.checkedInVenue ? 'Yes' : 'No',
    'Leader Name': t.leader.name,
    'Leader Email': t.leader.email,
    'Leader Phone': t.leader.phone,
    'Leader Reg No': t.leader.registrationNumber || '',
    'Leader Status': t.leader.residentialStatus || '',
    'Leader Mess': t.leader.messName || '',
    'Member 2 Name': t.member2?.name || '',
    'Member 2 Email': t.member2?.email || '',
    'Member 2 Reg No': t.member2?.registrationNumber || '',
    'Member 2 Status': t.member2?.residentialStatus || '',
    'Member 2 Mess': t.member2?.messName || '',
    'Member 3 Name': t.member3?.name || '',
    'Member 3 Email': t.member3?.email || '',
    'Member 3 Reg No': t.member3?.registrationNumber || '',
    'Member 3 Status': t.member3?.residentialStatus || '',
    'Member 3 Mess': t.member3?.messName || '',
    'Member 4 Name': t.member4?.name || '',
    'Member 4 Email': t.member4?.email || '',
    'Member 4 Reg No': t.member4?.registrationNumber || '',
    'Member 4 Status': t.member4?.residentialStatus || '',
    'Member 4 Mess': t.member4?.messName || '',
    'Member 5 Name': t.member5?.name || '',
    'Member 5 Email': t.member5?.email || '',
    'Member 5 Reg No': t.member5?.registrationNumber || '',
    'Member 5 Status': t.member5?.residentialStatus || '',
    'Member 5 Mess': t.member5?.messName || '',
    'Project Title': t.project?.title || 'Not Submitted',
    'Project GitHub': t.project?.githubUrl || '',
    'PPT/PDF Document Link': t.project?.presentationUrl || '',
    'Score': t.project?.score?.total || 'Unscored',
  }));

  if (data.length > 0) {
    worksheet.columns = Object.keys(data[0]).map((key) => ({
      header: key,
      key: key,
      width: 20,
    }));

    data.forEach((row) => {
      worksheet.addRow(row);
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="origin-teams-${Date.now()}.xlsx"`);
  res.send(Buffer.from(buffer));
};