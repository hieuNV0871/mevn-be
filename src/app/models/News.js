const mongoose = require('mongoose');
// const slug = require('mongoose-slug-generator');

// mongoose.plugin(slug);

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  // slug: {
  //   type: String,
  //   slug: 'title',
  //   unique: true
  // },
  author: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  publishedAt: {
    type: Date,
    default: Date.now
  }
},{timestamps: true});

module.exports = mongoose.model('News', newsSchema);