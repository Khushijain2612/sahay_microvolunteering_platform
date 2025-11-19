const Opportunity = require('../models/Opportunity'); 
 
exports.getOpportunities = async (req, res) =
  try { 
    const opportunities = await Opportunity.find({ status: 'active' }) 
      .populate('organization', 'name email avatar') 
      .sort({ createdAt: -1 }); 
    res.json({ success: true, data: { opportunities } }); 
  } catch (error) { 
    res.status(500).json({ success: false, message: 'Error fetching opportunities', error: error.message }); 
  } 
}; 
 
exports.getOpportunity = async (req, res) =
  try { 
    const opportunity = await Opportunity.findById(req.params.id).populate('organization', 'name email avatar'); 
    if (!opportunity) return res.status(404).json({ success: false, message: 'Opportunity not found' }); 
    res.json({ success: true, data: { opportunity } }); 
  } catch (error) { 
    res.status(500).json({ success: false, message: 'Error fetching opportunity', error: error.message }); 
  } 
}; 
 
exports.createOpportunity = async (req, res) =
  try { 
    req.body.organization = req.user.id; 
    const opportunity = await Opportunity.create(req.body); 
    await opportunity.populate('organization', 'name email avatar'); 
    res.status(201).json({ success: true, message: 'Opportunity created successfully', data: { opportunity } }); 
  } catch (error) { 
    res.status(500).json({ success: false, message: 'Error creating opportunity', error: error.message }); 
  } 
}; 
 
exports.applyForOpportunity = async (req, res) =
  try { 
    const opportunity = await Opportunity.findById(req.params.id); 
    if (!opportunity) return res.status(404).json({ success: false, message: 'Opportunity not found' }); 
    const alreadyApplied = opportunity.volunteersApplied.find(app = === req.user.id); 
    if (alreadyApplied) return res.status(400).json({ success: false, message: 'Already applied for this opportunity' }); 
    opportunity.volunteersApplied.push({ volunteer: req.user.id, status: 'pending' }); 
    await opportunity.save(); 
    res.json({ success: true, message: 'Applied for opportunity successfully' }); 
  } catch (error) { 
    res.status(500).json({ success: false, message: 'Error applying for opportunity', error: error.message }); 
  } 
}; 
