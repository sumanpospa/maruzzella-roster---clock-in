// Test if recovery branch has data
import { PrismaClient } from '@prisma/client';

async function testRecoveryBranch() {
  // You'll need to set DATABASE_URL to the recovery branch connection string
  const prisma = new PrismaClient();
  
  try {
    const employees = await prisma.employee.count();
    const shifts = await prisma.shift.count();
    const timeLogs = await prisma.timeLog.count();
    
    console.log('\n✅ Recovery Branch Database Check:');
    console.log('==================================');
    console.log('Employees:', employees);
    console.log('Shifts:', shifts);
    console.log('TimeLogs:', timeLogs);
    console.log('\n');
    
    if (shifts > 0) {
      console.log('🎉 SUCCESS! This branch has shift data!');
    } else {
      console.log('⚠️  WARNING: No shifts found in this branch.');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testRecoveryBranch();
