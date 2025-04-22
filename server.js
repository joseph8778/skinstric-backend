import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();

app.use(cors({ origin: "https://skinstric-jt-rdpp.vercel.app" }));
app.use(express.json());


app.get('/api/ping', (req, res) => {
    console.log('Frontend just pinged me!');
    res.json({message: 'pong from backend!'})
})
const prisma = new PrismaClient();
app.post('/api/user', async (req, res) => {
  const { clerkUserId, email, preferredName, formattedAddress, latitude, longitude, demoData } = req.body;

  console.log('Incoming request body:', req.body);

  if (!clerkUserId || !email) {
    return res.status(400).json({ message: 'Missing clerkUserId or email' });
  }

  try {
    const user = await prisma.user.upsert({
      where: { clerkUserId },
      update: {
        email,
        preferredName,
        formattedAddress,
        latitude,
        longitude,
        demoData
      },
      create: {
        clerkUserId,
        email,
        preferredName,
        formattedAddress,
        latitude,
        longitude,
        demoData
      },
    });

    res.status(200).json({ message: 'User synced', user });
    console.log('User info synced on backend')
  } catch (err) {
    console.error('❌ DB error:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
});

app.get('/api/user/:clerkUserId', async (req, res) => {
  const { clerkUserId } = req.params;
  try {
    const userData = await prisma.user.findUnique({
      where: { clerkUserId }
    })
    
    if( !userData ) {
        return res.status(404).json({message: 'User not found'})
    } 
    
    res.status(200).json({user: userData})
  } catch(err) {
    console.log('Error fetching userData:', err);
    res.status(500).json({message: 'Server error', error: err})
  }
})


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
