// const mongoose = require('mongoose');

// const topicSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   category: {
//     type: String,
//     required: true,
//     enum: [
//       'SRC',
//       'Library',
//       'Registrar',
//       'DSA',
//       'College',
//       'Department',
//       'Clinic',
//       'Security',
//       'General'
//     ],
//     trim: true
//   },
//   description: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   content: {
//     type: String,
//     required: true
//   },
//   order: {
//     type: Number,
//     required: true
//   },
//   isPublished: {
//     type: Boolean,
//     default: false
//   }
// }, { timestamps: true });

// module.exports = mongoose.model('Topic', topicSchema);

const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  dressCodeGuide: {
    doImage: {
      type: String,
      default: ''
    },
    dontImage: {
      type: String,
      default: ''
    },
    doItems: [{
      image: {
        type: String,
        required: true
      },
      description: {
        type: String,
        required: true,
        trim: true
      }
    }],
    dontItems: [{
      image: {
        type: String,
        required: true
      },
      description: {
        type: String,
        required: true,
        trim: true
      }
    }]
  },
  topicImages: [{
    image: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    }
  }],
  resourceLinks: [{
    url: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Topic', topicSchema);
