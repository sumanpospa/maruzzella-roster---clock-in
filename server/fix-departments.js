// Fix employee departments in database
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixDepartments() {
  try {
    console.log('\n🔧 Fixing employee departments...\n');
    
    // Kitchen employees (IDs 1-11)
    const kitchenIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    
    // FOH employees (IDs 12, 18-23)
    const fohIds = [12, 18, 19, 20, 21, 22, 23];
    
    // Stewarding employees (IDs 13-17, 24-27)
    const stewardingIds = [13, 14, 15, 16, 17, 24, 25, 26, 27];
    
    // Update Kitchen
    for (const id of kitchenIds) {
      await prisma.employee.update({
        where: { id },
        data: { department: 'Kitchen' }
      });
    }
    console.log(`✅ Updated ${kitchenIds.length} Kitchen employees`);
    
    // Update FOH
    for (const id of fohIds) {
      await prisma.employee.update({
        where: { id },
        data: { department: 'FOH' }
      });
    }
    console.log(`✅ Updated ${fohIds.length} FOH employees`);
    
    // Update Stewarding
    for (const id of stewardingIds) {
      await prisma.employee.update({
        where: { id },
        data: { department: 'Stewarding' }
      });
    }
    console.log(`✅ Updated ${stewardingIds.length} Stewarding employees`);
    
    console.log('\n📊 Verifying departments...\n');
    
    const byDept = await prisma.employee.groupBy({
      by: ['department'],
      _count: true,
      where: {
        id: { not: 999999 } // Exclude system employee
      }
    });
    
    byDept.forEach(d => {
      console.log(`  ${d.department}: ${d._count} employees`);
    });
    
    console.log('\n🎉 Departments fixed successfully!\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDepartments();
