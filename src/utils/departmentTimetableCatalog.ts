import { TimetableEntry, Faculty, Classroom, Subject } from '@/types';

export interface CatalogDepartment {
  code: string;
  name: string;
  hod: string;
  faculty: { id: number; name: string; designation: string; email: string }[];
  rooms: { id: number; roomNumber: string; name: string; type: string }[];
  subjects: Record<number, { code: string; name: string; isLab?: boolean }[]>;
}

export const DEPARTMENT_TIMETABLE_CATALOG: Record<string, CatalogDepartment> = {
  CHEM: {
    code: 'CHEM',
    name: 'Chemical Engineering',
    hod: 'Dr. Deepa',
    faculty: [
      { id: 1101, name: 'Dr. Deepa', designation: 'Professor & HOD', email: 'deepa.chem@aaip.edu' },
      { id: 1102, name: 'Dr. Venkatesh', designation: 'Associate Professor', email: 'venkatesh.chem@aaip.edu' },
      { id: 1103, name: 'Prof. Archana', designation: 'Assistant Professor', email: 'archana.chem@aaip.edu' },
    ],
    rooms: [
      { id: 2101, roomNumber: 'CH-101', name: 'Chemical Engineering Hall 101', type: 'Classroom' },
      { id: 2102, roomNumber: 'CH-LAB-01', name: 'Chemical Reaction & Unit Operations Lab', type: 'Laboratory' },
    ],
    subjects: {
      3: [
        { code: 'CH201', name: 'Chemical Process Calculations' },
        { code: 'CH202', name: 'Fluid Mechanics & Heat Transfer' },
        { code: 'CH203', name: 'Chemical Engineering Thermodynamics' },
        { code: 'CH204P', name: 'Chemical Reaction Engineering Lab', isLab: true },
        { code: 'CH205', name: 'Process Dynamics & Control' },
        { code: 'CH206', name: 'Mass Transfer Operations' },
      ],
      6: [
        { code: 'CH301', name: 'Petrochemical & Polymer Tech' },
        { code: 'CH302', name: 'Chemical Reaction Engg II' },
        { code: 'CH303', name: 'Transport Phenomena' },
        { code: 'CH304P', name: 'Process Simulation Lab', isLab: true },
        { code: 'CH305', name: 'Plant Design & Economics' },
        { code: 'CH306', name: 'Industrial Safety & HAZOP' },
      ],
    },
  },
  AERO: {
    code: 'AERO',
    name: 'Aerospace Engineering',
    hod: 'Dr. Sanjay',
    faculty: [
      { id: 1201, name: 'Dr. Sanjay', designation: 'Professor & HOD', email: 'sanjay.aero@aaip.edu' },
      { id: 1202, name: 'Dr. Vikram', designation: 'Associate Professor', email: 'vikram.aero@aaip.edu' },
      { id: 1203, name: 'Prof. Meera', designation: 'Assistant Professor', email: 'meera.aero@aaip.edu' },
    ],
    rooms: [
      { id: 2201, roomNumber: 'AE-101', name: 'Aerospace Lecture Theatre 101', type: 'Classroom' },
      { id: 2202, roomNumber: 'AE-LAB-01', name: 'Aerodynamics & Wind Tunnel Lab', type: 'Laboratory' },
    ],
    subjects: {
      3: [
        { code: 'AE201', name: 'Incompressible Aerodynamics' },
        { code: 'AE202', name: 'Aircraft Propulsion & Turbines' },
        { code: 'AE203', name: 'Aircraft Structures & Elasticity' },
        { code: 'AE204P', name: 'Aerodynamics & Propulsion Lab', isLab: true },
        { code: 'AE205', name: 'Flight Mechanics & Performance' },
        { code: 'AE206', name: 'Avionics & Flight Navigation' },
      ],
      6: [
        { code: 'AE301', name: 'Compressible Gas Dynamics' },
        { code: 'AE302', name: 'Rocket Propulsion & Space Flight' },
        { code: 'AE303', name: 'Finite Element Analysis for Aircraft' },
        { code: 'AE304P', name: 'Wind Tunnel Testing Lab', isLab: true },
        { code: 'AE305', name: 'Orbital Mechanics & Satellite Dynamics' },
        { code: 'AE306', name: 'Computational Fluid Dynamics' },
      ],
    },
  },
  AIML: {
    code: 'AIML',
    name: 'Artificial Intelligence & Machine Learning',
    hod: 'Dr. Manoj',
    faculty: [
      { id: 1301, name: 'Dr. Manoj', designation: 'Professor & HOD', email: 'manoj.aiml@aaip.edu' },
      { id: 1302, name: 'Dr. Harish', designation: 'Associate Professor', email: 'harish.aiml@aaip.edu' },
      { id: 1303, name: 'Prof. Swathi', designation: 'Assistant Professor', email: 'swathi.aiml@aaip.edu' },
    ],
    rooms: [
      { id: 2301, roomNumber: 'AI-101', name: 'AI & Intelligent Systems Hall', type: 'Classroom' },
      { id: 2302, roomNumber: 'AI-LAB-01', name: 'Deep Learning & GPU Supercomputing Lab', type: 'Laboratory' },
    ],
    subjects: {
      3: [
        { code: 'AI201', name: 'Machine Learning Foundations' },
        { code: 'AI202', name: 'Deep Neural Architectures' },
        { code: 'AI203', name: 'Applied Probability & Optimization' },
        { code: 'AI204P', name: 'Machine Learning & DL Lab', isLab: true },
        { code: 'AI205', name: 'Computer Vision & Visual Perception' },
        { code: 'AI206', name: 'Knowledge Representation & Reasoning' },
      ],
      6: [
        { code: 'AI301', name: 'Reinforcement Learning & Agents' },
        { code: 'AI302', name: 'Large Language Models & Transformers' },
        { code: 'AI303', name: 'AI Ethics, Safety & Explainability' },
        { code: 'AI304P', name: 'Generative AI & LLM Systems Lab', isLab: true },
        { code: 'AI305', name: 'Autonomous Robotics & Perception' },
        { code: 'AI306', name: 'Edge AI & Model Compression' },
      ],
    },
  },
  BME: {
    code: 'BME',
    name: 'Biomedical Engineering',
    hod: 'Dr. Rahul',
    faculty: [
      { id: 1401, name: 'Dr. Rahul', designation: 'Professor & HOD', email: 'rahul.bme@aaip.edu' },
      { id: 1402, name: 'Dr. Nandhini', designation: 'Associate Professor', email: 'nandhini.bme@aaip.edu' },
      { id: 1403, name: 'Prof. Vignesh', designation: 'Assistant Professor', email: 'vignesh.bme@aaip.edu' },
    ],
    rooms: [
      { id: 2401, roomNumber: 'BM-101', name: 'Biomedical Sciences Hall 101', type: 'Classroom' },
      { id: 2402, roomNumber: 'BM-LAB-01', name: 'Biomedical Instrumentation & Signals Lab', type: 'Laboratory' },
    ],
    subjects: {
      3: [
        { code: 'BM201', name: 'Biomedical Instrumentation' },
        { code: 'BM202', name: 'Physiological Systems & Signals' },
        { code: 'BM203', name: 'Biomechanics & Biomaterials' },
        { code: 'BM204P', name: 'Biomedical Sensors & Telemetry Lab', isLab: true },
        { code: 'BM205', name: 'Medical Imaging Fundamentals' },
        { code: 'BM206', name: 'Clinical Engineering Standards' },
      ],
      6: [
        { code: 'BM301', name: 'Diagnostic Ultrasound & MRI Systems' },
        { code: 'BM302', name: 'Neural Engineering & Prosthetics' },
        { code: 'BM303', name: 'Biosignal Pattern Classification' },
        { code: 'BM304P', name: 'Hospital Telemetry & Bio-CAD Lab', isLab: true },
        { code: 'BM305', name: 'Telemedicine & Medical IoT' },
        { code: 'BM306', name: 'Radiation Physics & Hospital Safety' },
      ],
    },
  },
  CIVIL: {
    code: 'CIVIL',
    name: 'Civil Engineering',
    hod: 'Dr. Priya',
    faculty: [
      { id: 1501, name: 'Dr. Priya', designation: 'Professor & HOD', email: 'priya.civil@aaip.edu' },
      { id: 1502, name: 'Dr. Murugan', designation: 'Associate Professor', email: 'murugan.civil@aaip.edu' },
      { id: 1503, name: 'Prof. Gayathri', designation: 'Assistant Professor', email: 'gayathri.civil@aaip.edu' },
    ],
    rooms: [
      { id: 2501, roomNumber: 'CE-101', name: 'Civil Engineering Hall 101', type: 'Classroom' },
      { id: 2502, roomNumber: 'CE-LAB-01', name: 'Structural & Concrete Technology Lab', type: 'Laboratory' },
    ],
    subjects: {
      3: [
        { code: 'CE201', name: 'Structural Analysis & Mechanics' },
        { code: 'CE202', name: 'Soil Mechanics & Geotechnics' },
        { code: 'CE203', name: 'Fluid Mechanics & Hydraulics' },
        { code: 'CE204P', name: 'Strength of Materials Lab', isLab: true },
        { code: 'CE205', name: 'Surveying & Geomatics' },
        { code: 'CE206', name: 'Building Construction Materials' },
      ],
      6: [
        { code: 'CE301', name: 'Design of Reinforced Concrete Structures' },
        { code: 'CE302', name: 'Foundation Engineering' },
        { code: 'CE303', name: 'Environmental Engineering & Water Supply' },
        { code: 'CE304P', name: 'Environmental & Hydraulics Lab', isLab: true },
        { code: 'CE305', name: 'Transportation Engineering & Highways' },
        { code: 'CE306', name: 'Prestressed Concrete Structures' },
      ],
    },
  },
  CSE: {
    code: 'CSE',
    name: 'Computer Science & Engineering',
    hod: 'Dr. Kaviya',
    faculty: [
      { id: 1, name: 'Dr. Kaviya', designation: 'Professor & HOD', email: 'hod.cse@aaip.edu' },
      { id: 2, name: 'Dr. Sham', designation: 'Associate Professor', email: 'dr.elena@aaip.edu' },
      { id: 3, name: 'Dr. Suresh', designation: 'Professor', email: 'linus.t@aaip.edu' },
    ],
    rooms: [
      { id: 1, roomNumber: 'A-101', name: 'Turing Lecture Hall 101', type: 'Classroom' },
      { id: 4, roomNumber: 'CS-201', name: 'Advanced AI & Graphics Lab', type: 'Laboratory' },
    ],
    subjects: {
      3: [
        { code: 'CS201', name: 'Data Structures & Algorithm Analysis' },
        { code: 'CS202', name: 'Object-Oriented Programming (Java)' },
        { code: 'CS203', name: 'Computer Organization & Architecture' },
        { code: 'CS204P', name: 'Data Structures & Java Lab', isLab: true },
        { code: 'CS205', name: 'Discrete Mathematics & Logic' },
        { code: 'CS206', name: 'Digital Systems & Microprocessors' },
      ],
      6: [
        { code: 'CS301', name: 'Design & Analysis of Algorithms' },
        { code: 'CS302', name: 'Artificial Intelligence & Machine Learning' },
        { code: 'CS303', name: 'Distributed Operating Systems' },
        { code: 'CS304P', name: 'AI & Machine Learning Laboratory', isLab: true },
        { code: 'CS305', name: 'Compiler Design & Optimization' },
        { code: 'CS306', name: 'Cloud Computing Architectures' },
      ],
    },
  },
  CT: {
    code: 'CT',
    name: 'Computing Technologies',
    hod: 'Dr. Divya',
    faculty: [
      { id: 1601, name: 'Dr. Divya', designation: 'Professor & HOD', email: 'divya.ct@aaip.edu' },
      { id: 1602, name: 'Dr. Ramesh', designation: 'Associate Professor', email: 'ramesh.ct@aaip.edu' },
      { id: 1603, name: 'Prof. Janani', designation: 'Assistant Professor', email: 'janani.ct@aaip.edu' },
    ],
    rooms: [
      { id: 2601, roomNumber: 'CT-101', name: 'Computing Technologies Hall', type: 'Classroom' },
      { id: 2602, roomNumber: 'CT-LAB-01', name: 'Advanced Software Systems Lab', type: 'Laboratory' },
    ],
    subjects: {
      3: [
        { code: 'CT201', name: 'Data Structures & Algorithms' },
        { code: 'CT202', name: 'Database Management Systems' },
        { code: 'CT203', name: 'Object-Oriented Programming' },
        { code: 'CT204P', name: 'Full-Stack Development Lab', isLab: true },
        { code: 'CT205', name: 'Operating Systems & Linux' },
        { code: 'CT206', name: 'Computer Networks' },
      ],
      6: [
        { code: 'CT301', name: 'Full-Stack Web Architectures' },
        { code: 'CT302', name: 'Cloud Computing & Microservices' },
        { code: 'CT303', name: 'Information Security & Cryptography' },
        { code: 'CT304P', name: 'Enterprise Cloud Application Lab', isLab: true },
        { code: 'CT305', name: 'Mobile App Architecture' },
        { code: 'CT306', name: 'Agile Software Engineering' },
      ],
    },
  },
  DSAI: {
    code: 'DSAI',
    name: 'Data Science & Artificial Intelligence',
    hod: 'Dr. Sneha',
    faculty: [
      { id: 1701, name: 'Dr. Sneha', designation: 'Associate Professor & HOD', email: 'ada.l@aaip.edu' },
      { id: 1702, name: 'Dr. Karthik', designation: 'Associate Professor', email: 'karthik.dsai@aaip.edu' },
      { id: 1703, name: 'Prof. Pooja', designation: 'Assistant Professor', email: 'pooja.dsai@aaip.edu' },
    ],
    rooms: [
      { id: 2701, roomNumber: 'DS-101', name: 'Data Science Lecture Hall 101', type: 'Classroom' },
      { id: 2702, roomNumber: 'DS-LAB-01', name: 'Big Data & Analytics Cluster Lab', type: 'Laboratory' },
    ],
    subjects: {
      3: [
        { code: 'DS201', name: 'Foundations of Data Science' },
        { code: 'DS202', name: 'Statistical Inference & Regression' },
        { code: 'DS203', name: 'Data Structures in Python' },
        { code: 'DS204P', name: 'Data Science & Visualization Lab', isLab: true },
        { code: 'DS205', name: 'Database Systems & NoSQL' },
        { code: 'DS206', name: 'Linear Algebra for Machine Learning' },
      ],
      6: [
        { code: 'DS301', name: 'Big Data Analytics & Spark' },
        { code: 'DS501', name: 'Deep Learning Architectures' },
        { code: 'DS303', name: 'Natural Language Processing & Text Mining' },
        { code: 'DS304P', name: 'Big Data & Deep Learning Lab', isLab: true },
        { code: 'DS305', name: 'Time Series & Predictive Analytics' },
        { code: 'DS306', name: 'Data Privacy & AI Ethics' },
      ],
    },
  },
  EEE: {
    code: 'EEE',
    name: 'Electrical & Electronics Engineering',
    hod: 'Dr. Rajesh',
    faculty: [
      { id: 1801, name: 'Dr. Rajesh', designation: 'Professor & HOD', email: 'rajesh.eee@aaip.edu' },
      { id: 1802, name: 'Dr. Saravanan', designation: 'Associate Professor', email: 'saravanan.eee@aaip.edu' },
      { id: 1803, name: 'Prof. Keerthana', designation: 'Assistant Professor', email: 'keerthana.eee@aaip.edu' },
    ],
    rooms: [
      { id: 2801, roomNumber: 'EE-101', name: 'Electrical Power Lecture Hall 101', type: 'Classroom' },
      { id: 2802, roomNumber: 'EE-LAB-01', name: 'Electrical Machines & Power Systems Lab', type: 'Laboratory' },
    ],
    subjects: {
      3: [
        { code: 'EE201', name: 'Electric Circuit Analysis' },
        { code: 'EE202', name: 'Electrical Machines I' },
        { code: 'EE203', name: 'Electromagnetic Field Theory' },
        { code: 'EE204P', name: 'Electrical Machines Lab', isLab: true },
        { code: 'EE205', name: 'Analog Electronics & Op-Amps' },
        { code: 'EE206', name: 'Power Generation & Transmission' },
      ],
      6: [
        { code: 'EE301', name: 'Power System Analysis & Faults' },
        { code: 'EE302', name: 'Power Electronics & Drives' },
        { code: 'EE303', name: 'Control Systems & State Feedback' },
        { code: 'EE304P', name: 'Power Electronics & Drives Lab', isLab: true },
        { code: 'EE305', name: 'Microcontrollers & Embedded Controllers' },
        { code: 'EE306', name: 'Renewable Energy Integration' },
      ],
    },
  },
  ECE: {
    code: 'ECE',
    name: 'Electronics & Communication Engineering',
    hod: 'Dr. Anitha',
    faculty: [
      { id: 1901, name: 'Dr. Anitha', designation: 'Professor & HOD', email: 'shannon.c@aaip.edu' },
      { id: 1902, name: 'Dr. Balaji', designation: 'Associate Professor', email: 'balaji.ece@aaip.edu' },
      { id: 1903, name: 'Prof. Divya ECE', designation: 'Assistant Professor', email: 'divya.ece@aaip.edu' },
    ],
    rooms: [
      { id: 2, roomNumber: 'B-103', name: 'Shannon Lecture Hall 103', type: 'Classroom' },
      { id: 5, roomNumber: 'EC-105', name: 'Microprocessors & Embedded Systems Lab', type: 'Laboratory' },
    ],
    subjects: {
      3: [
        { code: 'EC201', name: 'Electronic Circuits & Devices' },
        { code: 'EC202', name: 'Signals & Systems' },
        { code: 'EC203', name: 'Digital System Design & HDL' },
        { code: 'EC204P', name: 'Digital Systems & HDL Lab', isLab: true },
        { code: 'EC205', name: 'Electromagnetic Theory' },
        { code: 'EC206', name: 'Analog Integrated Circuits' },
      ],
      6: [
        { code: 'EC301', name: 'Digital Signal Processing' },
        { code: 'EC302', name: 'VLSI Design & CMOS Architectures' },
        { code: 'EC303', name: 'Digital Communication Systems' },
        { code: 'EC304P', name: 'VLSI Design & DSP Lab', isLab: true },
        { code: 'EC305', name: 'Wireless Networks & Cellular Comms' },
        { code: 'EC306', name: 'Antenna Theory & Microwave Engg' },
      ],
    },
  },
  IT: {
    code: 'IT',
    name: 'Information Technology',
    hod: 'Dr. Suresh',
    faculty: [
      { id: 2001, name: 'Dr. Suresh', designation: 'Professor & HOD', email: 'suresh.it@aaip.edu' },
      { id: 2002, name: 'Dr. Pavithra', designation: 'Associate Professor', email: 'pavithra.it@aaip.edu' },
      { id: 2003, name: 'Prof. Ashwin', designation: 'Assistant Professor', email: 'ashwin.it@aaip.edu' },
    ],
    rooms: [
      { id: 3001, roomNumber: 'IT-101', name: 'Information Technology Hall 101', type: 'Classroom' },
      { id: 3002, roomNumber: 'IT-LAB-01', name: 'Cloud Computing & Full-Stack Lab', type: 'Laboratory' },
    ],
    subjects: {
      3: [
        { code: 'IT201', name: 'Object-Oriented Programming (Java)' },
        { code: 'IT202', name: 'Database Management Systems' },
        { code: 'IT203', name: 'Data Structures & Algorithms' },
        { code: 'IT204P', name: 'Web Technologies & DB Lab', isLab: true },
        { code: 'IT205', name: 'Computer Organization & Architecture' },
        { code: 'IT206', name: 'Software Engineering Fundamentals' },
      ],
      6: [
        { code: 'IT301', name: 'Cloud Computing & Virtualization' },
        { code: 'IT302', name: 'Network Security & Cryptography' },
        { code: 'IT303', name: 'Full-Stack Web & Microservices' },
        { code: 'IT304P', name: 'Cloud & DevOps Pipeline Lab', isLab: true },
        { code: 'IT305', name: 'Mobile Application Architecture' },
        { code: 'IT306', name: 'Data Warehousing & BI' },
      ],
    },
  },
  MECH: {
    code: 'MECH',
    name: 'Mechanical Engineering',
    hod: 'Dr. Vijay',
    faculty: [
      { id: 2101, name: 'Dr. Vijay', designation: 'Professor & HOD', email: 'goddard.r@aaip.edu' },
      { id: 2102, name: 'Dr. Natarajan', designation: 'Associate Professor', email: 'natarajan.mech@aaip.edu' },
      { id: 2103, name: 'Prof. Gowtham', designation: 'Assistant Professor', email: 'gowtham.mech@aaip.edu' },
    ],
    rooms: [
      { id: 3, roomNumber: 'ME-101', name: 'Mechanical Lecture Hall 101', type: 'Classroom' },
      { id: 6, roomNumber: 'ME-108', name: 'CAD/CAM & Robotics Studio', type: 'Laboratory' },
    ],
    subjects: {
      3: [
        { code: 'ME201', name: 'Engineering Thermodynamics' },
        { code: 'ME202', name: 'Manufacturing Technology I' },
        { code: 'ME203', name: 'Fluid Mechanics & Machinery' },
        { code: 'ME204P', name: 'Thermal & Fluid Mechanics Lab', isLab: true },
        { code: 'ME205', name: 'Strength of Materials' },
        { code: 'ME206', name: 'Kinematics of Machinery' },
      ],
      6: [
        { code: 'ME301', name: 'Thermodynamics & Heat Transfer' },
        { code: 'ME302', name: 'Design of Transmission Systems' },
        { code: 'ME303', name: 'Finite Element Analysis' },
        { code: 'ME304P', name: 'CAD/CAM & Automation Lab', isLab: true },
        { code: 'ME305', name: 'Automobile Engineering & EVs' },
        { code: 'ME306', name: 'Operations Research & Optimization' },
      ],
    },
  },
  MCT: {
    code: 'MCT',
    name: 'Mechatronics Engineering',
    hod: 'Dr. Arun',
    faculty: [
      { id: 2201, name: 'Dr. Arun', designation: 'Professor & HOD', email: 'arun.mct@aaip.edu' },
      { id: 2202, name: 'Dr. Shanthi', designation: 'Associate Professor', email: 'shanthi.mct@aaip.edu' },
      { id: 2203, name: 'Prof. Pradeep', designation: 'Assistant Professor', email: 'pradeep.mct@aaip.edu' },
    ],
    rooms: [
      { id: 3201, roomNumber: 'MC-101', name: 'Mechatronics Lecture Hall 101', type: 'Classroom' },
      { id: 3202, roomNumber: 'MC-LAB-01', name: 'Robotics, PLC & Automation Lab', type: 'Laboratory' },
    ],
    subjects: {
      3: [
        { code: 'MC201', name: 'Sensors & Signal Conditioning' },
        { code: 'MC202', name: 'Kinematics of Machinery' },
        { code: 'MC203', name: 'Digital Electronics & Microprocessors' },
        { code: 'MC204P', name: 'Sensors & Actuators Lab', isLab: true },
        { code: 'MC205', name: 'Fluid Power & Pneumatics' },
        { code: 'MC206', name: 'Engineering Mechanics' },
      ],
      6: [
        { code: 'MC301', name: 'Industrial Robotics & Kinematics' },
        { code: 'MC302', name: 'PLC, SCADA & Industrial Networks' },
        { code: 'MC303', name: 'Embedded Microcontrollers & RTOS' },
        { code: 'MC304P', name: 'Robotics & PLC Automation Lab', isLab: true },
        { code: 'MC305', name: 'Machine Vision & Inspection Systems' },
        { code: 'MC306', name: 'Mechatronic System Design' },
      ],
    },
  },
};

// Aliases
DEPARTMENT_TIMETABLE_CATALOG['CT_UG'] = DEPARTMENT_TIMETABLE_CATALOG['CT'];
DEPARTMENT_TIMETABLE_CATALOG['CT_PG'] = DEPARTMENT_TIMETABLE_CATALOG['CT'];

const SCHEDULE_PATTERN: {
  day: string;
  start: string;
  end: string;
  subjIdx: number;
  facIdx: number;
  isLab: boolean;
}[] = [
  // Monday
  { day: 'Monday', start: '09:00', end: '10:00', subjIdx: 0, facIdx: 0, isLab: false },
  { day: 'Monday', start: '10:15', end: '11:15', subjIdx: 1, facIdx: 1, isLab: false },
  { day: 'Monday', start: '11:30', end: '12:30', subjIdx: 2, facIdx: 2, isLab: false },
  { day: 'Monday', start: '13:30', end: '15:30', subjIdx: 3, facIdx: 1, isLab: true },
  { day: 'Monday', start: '15:30', end: '16:30', subjIdx: 4, facIdx: 1, isLab: false },

  // Tuesday
  { day: 'Tuesday', start: '09:00', end: '10:00', subjIdx: 4, facIdx: 1, isLab: false },
  { day: 'Tuesday', start: '10:15', end: '11:15', subjIdx: 0, facIdx: 0, isLab: false },
  { day: 'Tuesday', start: '11:30', end: '12:30', subjIdx: 1, facIdx: 1, isLab: false },
  { day: 'Tuesday', start: '13:30', end: '14:30', subjIdx: 2, facIdx: 2, isLab: false },
  { day: 'Tuesday', start: '14:30', end: '15:30', subjIdx: 5, facIdx: 2, isLab: false },
  { day: 'Tuesday', start: '15:30', end: '16:30', subjIdx: 0, facIdx: 0, isLab: false },

  // Wednesday
  { day: 'Wednesday', start: '09:00', end: '10:00', subjIdx: 5, facIdx: 2, isLab: false },
  { day: 'Wednesday', start: '10:15', end: '11:15', subjIdx: 2, facIdx: 2, isLab: false },
  { day: 'Wednesday', start: '11:30', end: '12:30', subjIdx: 0, facIdx: 0, isLab: false },
  { day: 'Wednesday', start: '13:30', end: '14:30', subjIdx: 1, facIdx: 1, isLab: false },
  { day: 'Wednesday', start: '14:30', end: '15:30', subjIdx: 4, facIdx: 1, isLab: false },
  { day: 'Wednesday', start: '15:30', end: '16:30', subjIdx: 5, facIdx: 2, isLab: false },

  // Thursday
  { day: 'Thursday', start: '09:00', end: '10:00', subjIdx: 1, facIdx: 1, isLab: false },
  { day: 'Thursday', start: '10:15', end: '11:15', subjIdx: 4, facIdx: 1, isLab: false },
  { day: 'Thursday', start: '11:30', end: '12:30', subjIdx: 0, facIdx: 0, isLab: false },
  { day: 'Thursday', start: '13:30', end: '15:30', subjIdx: 3, facIdx: 0, isLab: true },
  { day: 'Thursday', start: '15:30', end: '16:30', subjIdx: 2, facIdx: 2, isLab: false },

  // Friday
  { day: 'Friday', start: '09:00', end: '10:00', subjIdx: 2, facIdx: 2, isLab: false },
  { day: 'Friday', start: '10:15', end: '11:15', subjIdx: 4, facIdx: 1, isLab: false },
  { day: 'Friday', start: '11:30', end: '12:30', subjIdx: 1, facIdx: 1, isLab: false },
  { day: 'Friday', start: '13:30', end: '14:30', subjIdx: 0, facIdx: 0, isLab: false },
  { day: 'Friday', start: '14:30', end: '15:30', subjIdx: 5, facIdx: 2, isLab: false },
  { day: 'Friday', start: '15:30', end: '16:30', subjIdx: 2, facIdx: 2, isLab: false },

  // Saturday
  { day: 'Saturday', start: '09:00', end: '10:00', subjIdx: 4, facIdx: 1, isLab: false },
  { day: 'Saturday', start: '10:15', end: '11:15', subjIdx: 0, facIdx: 0, isLab: false },
  { day: 'Saturday', start: '11:30', end: '12:30', subjIdx: 5, facIdx: 2, isLab: false },
];

/**
 * Returns synthetic conflict-free timetable entries for any given department & semester.
 */
export function generateSyntheticDepartmentTimetable(
  deptCodeOrName?: string | null,
  deptId: number = 1,
  semester: number = 6,
  batch: string = 'Section A'
): TimetableEntry[] {
  let cleanCode = (deptCodeOrName || 'CSE').toUpperCase().trim();
  // Strip parentheses e.g. "Chemical Engineering (CHEM)" -> "CHEM"
  const match = cleanCode.match(/\(([A-Z_]+)\)/);
  if (match) {
    cleanCode = match[1];
  }

  // Find in catalog
  let catalogDept = DEPARTMENT_TIMETABLE_CATALOG[cleanCode];
  if (!catalogDept) {
    for (const key of Object.keys(DEPARTMENT_TIMETABLE_CATALOG)) {
      if (cleanCode.includes(key) || DEPARTMENT_TIMETABLE_CATALOG[key].name.toUpperCase().includes(cleanCode)) {
        catalogDept = DEPARTMENT_TIMETABLE_CATALOG[key];
        break;
      }
    }
  }

  if (!catalogDept) {
    catalogDept = DEPARTMENT_TIMETABLE_CATALOG['CSE'];
  }

  const semKey = semester % 2 === 1 ? 3 : 6;
  const subjects = catalogDept.subjects[semKey] || catalogDept.subjects[6] || catalogDept.subjects[3];
  const faculty = catalogDept.faculty;
  const lectureRoom = catalogDept.rooms[0];
  const labRoom = catalogDept.rooms[1] || catalogDept.rooms[0];

  return SCHEDULE_PATTERN.map((slot, idx) => {
    const subj = subjects[slot.subjIdx % subjects.length];
    const fac = faculty[slot.facIdx % faculty.length];
    const room = slot.isLab ? labRoom : lectureRoom;

    return {
      id: 90000 + deptId * 100 + idx,
      timetable_id: 1,
      department_id: deptId,
      course_id: 1,
      semester,
      batch,
      subject_id: 8000 + slot.subjIdx,
      faculty_id: fac.id,
      classroom_id: room.id,
      day_of_week: slot.day,
      start_time: slot.start,
      end_time: slot.end,
      created_at: new Date().toISOString(),
      subject_name: subj.name,
      subject_code: subj.code,
      faculty_name: fac.name,
      classroom_name: room.name,
      room_number: room.roomNumber,
      department_name: catalogDept.name,
    };
  });
}

/**
 * Returns faculty for a department from catalog if DB returns empty
 */
export function getCatalogFacultyForDepartment(deptCodeOrName?: string | null, deptId: number = 1): Faculty[] {
  let cleanCode = (deptCodeOrName || 'CSE').toUpperCase().trim();
  const match = cleanCode.match(/\(([A-Z_]+)\)/);
  if (match) cleanCode = match[1];

  let catalogDept = DEPARTMENT_TIMETABLE_CATALOG[cleanCode];
  if (!catalogDept) {
    for (const key of Object.keys(DEPARTMENT_TIMETABLE_CATALOG)) {
      if (cleanCode.includes(key) || DEPARTMENT_TIMETABLE_CATALOG[key].name.toUpperCase().includes(cleanCode)) {
        catalogDept = DEPARTMENT_TIMETABLE_CATALOG[key];
        break;
      }
    }
  }

  if (!catalogDept) return [];

  return catalogDept.faculty.map((f) => ({
    id: f.id,
    faculty_id: `FAC-${catalogDept.code}-${f.id % 100}`,
    full_name: f.name,
    email: f.email,
    department_id: deptId,
    designation: f.designation,
    specialization: 'Core Department Specialization',
    max_weekly_workload: 18,
    status: 'Active',
    created_at: new Date().toISOString(),
  }));
}
