const shortid = require('shortid');
const { Url, Analytics } = require('../models');

exports.createShortUrl = async (req, res) => {
  try {
    const { originalUrl } = req.body;
    const userId = req.user.id;
    
    const url = await Url.create({
      originalUrl,
      userId,
      shortUrl: shortid.generate()
    });
    
    res.json(url);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getUrls = async (req, res) => {
  try {
    const urls = await Url.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Analytics,
          as: 'analytics',
          attributes: ['id', 'visitorIp', 'createdAt']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(urls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.redirect = async (req, res) => {
  try {
    const { shortUrl } = req.params;
    const url = await Url.findOne({ 
      where: { shortUrl },
      include: [
        {
          model: Analytics,
          as: 'analytics'
        }
      ]
    });
    
    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Increment clicks
    await url.increment('clicks');

    // Create analytics entry
    await Analytics.create({
      urlId: url.id,
      visitorIp: req.ip,
      userAgent: req.get('User-Agent'),
      referrer: req.get('Referrer')
    });

    res.redirect(url.originalUrl);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};