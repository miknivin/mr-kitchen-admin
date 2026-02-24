import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Please enter coupon code'],
        unique: true,
        uppercase: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please enter coupon description']
    },
    discountType: {
        type: String,
        required: [true, 'Please specify discount type'],
        enum: ['percentage', 'fixed']
    },
    discountValue: {
        type: Number,
        required: [true, 'Please enter discount value']
    },
    minimumPurchase: {
        type: Number,
        default: 0
    },
    maximumDiscount: {
        type: Number
    },
    startDate: {
        type: Date,
        required: [true, 'Please enter start date']
    },
    endDate: {
        type: Date,
        required: [true, 'Please enter end date']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    usageLimit: {
        type: Number,
        default: null
    },
    usedCount: {
        type: Number,
        default: 0
    },
    applicableProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add index for better query performance
couponSchema.index({ code: 1 });

export default mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);