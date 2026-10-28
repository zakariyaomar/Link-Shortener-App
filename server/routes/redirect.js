// server/routes/redirect.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Handle redirects -- this catches /:shortCode
router.get('/:shortCode', async (req, res) => {
  const { shortCode } = req.params;

  // Skip API routes and common paths
  if (shortCode === 'api' || shortCode === 'favicon.ico') {
    return res.status(404).json({ error: 'Not found' });
  }

  try {
    const link = await prisma.link.findUnique({
      where: { shortCode },
    });

    if (!link) {
      return res.status(404).json({ error: 'Short link not found' });
    }

    // Check if link has expired
    if (link.expiresAt && new Date() > link.expiresAt) {
      return res.status(410).json({ error: 'This link has expired' });
    }

    // Record the click (fire and forget -- do not block the redirect)
    prisma.link.update({
      where: { id: link.id },
      data: {
        clicks: { increment: 1 },
        lastClicked: new Date(),
      },
    }).catch(err => console.error('Failed to update click count:', err));

    prisma.clickEvent.create({
      data: {
        linkId: link.id,
        referrer: req.headers.referer || null,
        userAgent: req.headers['user-agent'] || null,
      },
    }).catch(err => console.error('Failed to create click event:', err));

    // Redirect to the original URL
    res.redirect(301, link.originalUrl);
  } catch (err) {
    console.error('Redirect error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;