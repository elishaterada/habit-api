import mongoose from 'mongoose';

const { Schema } = mongoose;
const { ObjectId } = Schema;

const HabitSchema = new Schema({
  user: ObjectId,
  title: String,
});

const HabitModel = mongoose.model('Habit', HabitSchema);

export default HabitModel;
