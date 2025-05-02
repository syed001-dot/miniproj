const { Analytics, Url, User } = require('../models');

exports.trackVisit = async (req, res) => {
  try {
    const { shortUrl } = req.params;
    const url = await Url.findOne({ 
      where: { shortUrl },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username']
        }
      ]
    });
    
    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    const analytics = await Analytics.create({
      urlId: url.id,
      visitorIp: req.ip,
      userAgent: req.get('User-Agent'),
      referrer: req.get('Referrer'),
      country: req.headers['cf-ipcountry'] || null, // If using Cloudflare
      browser: req.useragent?.browser || null,
      device: req.useragent?.isMobile ? 'mobile' : 'desktop'
    });

    res.status(200).json({ message: 'Visit tracked', analytics });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const { urlId } = req.params;
    const analytics = await Analytics.findAll({
      where: { urlId },
      include: [
        {
          model: Url,
          as: 'url',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Group analytics by different criteria
    const summary = {
      totalVisits: analytics.length,
      uniqueVisitors: new Set(analytics.map(a => a.visitorIp)).size,
      byBrowser: analytics.reduce((acc, curr) => {
        acc[curr.browser] = (acc[curr.browser] || 0) + 1;
        return acc;
      }, {}),
      byDevice: analytics.reduce((acc, curr) => {
        acc[curr.device] = (acc[curr.device] || 0) + 1;
        return acc;
      }, {}),
      byCountry: analytics.reduce((acc, curr) => {
        if (curr.country) {
          acc[curr.country] = (acc[curr.country] || 0) + 1;
        }
        return acc;
      }, {})
    };
    
    res.json({ analytics, summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};