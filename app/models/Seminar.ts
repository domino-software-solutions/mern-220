import { ObjectId } from "mongodb";

class Seminar {
  _id: ObjectId;
  title: string;
  date: string;
  time: string;
  description: string;
  capacity: number;
  price: number;
  agentId: ObjectId;
  attendees: string[];
  invitees: string[];
  confirmedAttendees: string[];
  createdAt: Date;

  constructor(data: {
    _id?: string;
    title: string;
    date: string;
    time: string;
    description: string;
    capacity: number;
    price: number;
    agentId: string;
    attendees?: string[];
    invitees?: string[];
    confirmedAttendees?: string[];
    createdAt?: Date;
  }) {
    this._id = data._id ? new ObjectId(data._id) : new ObjectId();
    this.title = data.title;
    this.date = data.date;
    this.time = data.time;
    this.description = data.description;
    this.capacity = data.capacity;
    this.price = data.price;
    this.agentId = new ObjectId(data.agentId);
    this.attendees = data.attendees || [];
    this.invitees = data.invitees || [];
    this.confirmedAttendees = data.confirmedAttendees || [];
    this.createdAt = data.createdAt || new Date();
  }
}

export default Seminar;
