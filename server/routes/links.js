// server/routes/links.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');
const { generateShortCode } = require('../utils/generateCode');

const router = express.Router();
const prisma = new PrismaClient();

// Create a short link
router.post('/', authenticateToken, async (req, res) => {
  const { url, customCode, expiresAt } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format. Include http:// or https://' });
  }

  try {
    let shortCode;

    if (customCode) {
      // Validate custom code: alphanumeric and hyphens only, 3-20 characters
      if (!/^[a-zA-Z0-9-]{3,20}$/.test(customCode)) {
        return res.status(400).json({
          error: 'Custom code must be 3-20 characters, using only letters, numbers, and hyphens'
        });
      }

      const existing = await prisma.link.findUnique({ where: { shortCode: customCode } });
      if (existing) {
        return res.status(409).json({ error: 'This custom code is already taken' });
      }

      shortCode = customCode;
    } else {
      // Generate a unique short code
      shortCode = generateShortCode();

      // Ensure uniqueness (extremely unlikely collision, but handle it)
      let attempts = 0;
      while (await prisma.link.findUnique({ where: { shortCode } })) {
        shortCode = generateShortCode();
        attempts++;
        if (attempts > 5) {
          return res.status(500).json({ error: 'Failed to generate unique code' });
        }
      }
    }

    const link = await prisma.link.create({
      data: {
        originalUrl: url,
        shortCode,
        userId: req.user.id,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    const shortUrl = `${process.env.BASE_URL}/${link.shortCode}`;

    res.status(201).json({
      id: link.id,
      originalUrl: link.originalUrl,
      shortCode: link.shortCode,
      shortUrl,
      clicks: link.clicks,
      expiresAt: link.expiresAt,
      createdAt: link.createdAt,
    });
  } catch (err) {
    console.error('Create link error:', err);
    res.status(500).json({ error: 'Failed to create short link' });
  }
});

// Get all links for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize) || 10));
  const skip = (page - 1) * pageSize;

  try {
    const [links, totalItems] = await Promise.all([
      prisma.link.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.link.count({ where: { userId: req.user.id } }),
    ]);

    const totalPages = Math.ceil(totalItems / pageSize);

    const linksWithShortUrl = links.map(link => ({
      ...link,
      shortUrl: `${process.env.BASE_URL}/${link.shortCode}`,
    }));

    res.json({
      data: linksWithShortUrl,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (err) {
    console.error('Get links error:', err);
    res.status(500).json({ error: 'Failed to fetch links' });
  }
});

// Get link stats
router.get('/:id/stats', authenticateToken, async (req, res) => {
  try {
    const link = await prisma.link.findFirst({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.id,
      },
      include: {
        clickEvents: {
          orderBy: { clickedAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    // Clicks per day for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyClicks = await prisma.clickEvent.groupBy({
      by: ['clickedAt'],
      where: {
        linkId: link.id,
        clickedAt: { gte: sevenDaysAgo },
      },
      _count: true,
    });

    res.json({
      id: link.id,
      originalUrl: link.originalUrl,
      shortCode: link.shortCode,
      shortUrl: `${process.env.BASE_URL}/${link.shortCode}`,
      totalClicks: link.clicks,
      lastClicked: link.lastClicked,
      createdAt: link.createdAt,
      recentClicks: link.clickEvents,
      dailyClicks,
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ error: 'Failed to fetch link stats' });
  }
});

// Delete a link
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const link = await prisma.link.findFirst({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.id,
      },
    });

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    await prisma.link.delete({ where: { id: link.id } });

    res.status(204).send();
  } catch (err) {
    console.error('Delete link error:', err);
    res.status(500).json({ error: 'Failed to delete link' });
  }
});

module.exports = router;