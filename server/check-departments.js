// Check employee departments
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDepartments() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: [{ department: 'asc' }, { id: 'asc' }]
    });
    
    console.log(`\n📊 Total Employees: ${employees.length}\n`);
    
    const byDept = {};
    employees.forEach(emp => {
      if (!byDept[emp.department]) byDept[emp.department] = [];
      byDept[emp.department].push(emp);
    });
    
    for (const [dept, emps] of Object.entries(byDept)) {
      console.log(`\n${dept}: ${emps.length} employees`);
      console.log('─'.repeat(50));
      emps.forEach(e => {
        console.log(`  ${e.id.toString().padStart(2)} | ${e.name.padEnd(15)} | ${e.role}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDepartments();
