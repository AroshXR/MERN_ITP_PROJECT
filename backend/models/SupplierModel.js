const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  contact: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  companyDetails: {
    registrationNumber: {
      type: String,
      unique: true,
      sparse: true, // This allows multiple null values
      trim: true
    }
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  lastOrder: {
    type: String,
    default: 'Never'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate automatic registration number
const generateRegistrationNumber = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `SUP${currentYear}`;
  
  // Find the highest existing registration number for this year
  const lastSupplier = await mongoose.model('Supplier').findOne({
    'companyDetails.registrationNumber': { $regex: `^${prefix}` }
  }).sort({ 'companyDetails.registrationNumber': -1 });
  
  let nextNumber = 1;
  if (lastSupplier && lastSupplier.companyDetails.registrationNumber) {
    const lastNumber = parseInt(lastSupplier.companyDetails.registrationNumber.replace(prefix, ''));
    nextNumber = lastNumber + 1;
  }
  
  // Format with leading zeros (e.g., SUP2024001, SUP2024002, etc.)
  return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
};

// Pre-save middleware to generate registration number and update timestamp
supplierSchema.pre('save', async function(next) {
  this.updatedAt = Date.now();
  
  // Generate registration number if it doesn't exist (for new suppliers)
  if (this.isNew && (!this.companyDetails || !this.companyDetails.registrationNumber)) {
    try {
      const registrationNumber = await generateRegistrationNumber();
      if (!this.companyDetails) {
        this.companyDetails = {};
      }
      this.companyDetails.registrationNumber = registrationNumber;
    } catch (error) {
      console.error('Error generating registration number:', error);
      return next(error);
    }
  }
  
  next();
});

module.exports = mongoose.model('Supplier', supplierSchema);
