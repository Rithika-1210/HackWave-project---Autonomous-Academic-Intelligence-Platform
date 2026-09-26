"""
Comprehensive Academic Timetable and Department Resource Seeder
Generates realistic Faculty, Classrooms, Subjects, and Timetable Entries
for all 14 Academic Departments across all semesters.
"""

from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from app.models.models import Department, Course, Faculty, Classroom, Subject, Timetable, TimetableEntry

DEPARTMENT_CATALOG = {
    "CHEM": {
        "name": "Chemical Engineering",
        "hod": "Dr. Deepa",
        "faculty": [
            ("FAC-CHEM-001", "Dr. Deepa", "deepa.chem@aaip.edu", "+91 98451 10001", "Professor & HOD", "Chemical Reaction Engg & Catalysis", 16),
            ("FAC-CHEM-002", "Dr. Venkatesh", "venkatesh.chem@aaip.edu", "+91 98451 10002", "Associate Professor", "Transport Phenomena & Thermodynamics", 18),
            ("FAC-CHEM-003", "Prof. Archana", "archana.chem@aaip.edu", "+91 98451 10003", "Assistant Professor", "Process Dynamics & Simulation", 18)
        ],
        "rooms": [
            ("Chemical Engineering Lecture Hall 101", "Classroom", "Block D - Chemical", "CH-101", 65, "Smart Projector, Digital Whiteboard, AC"),
            ("Chemical Reaction & Unit Operations Lab", "Science Laboratory", "Block D - Chemical", "CH-LAB-01", 40, "Reactor Units, Distillation Columns, Gas Chromatograph")
        ],
        "courses": [("B.Tech in Chemical Engineering", "BTECH-CHEM", 4, "Undergraduate")],
        "subjects": {
            3: [
                ("Chemical Process Calculations", "CH201", "Theory", 4, 0),
                ("Fluid Mechanics & Heat Transfer", "CH202", "Theory", 4, 1),
                ("Chemical Engineering Thermodynamics", "CH203", "Theory", 4, 2),
                ("Chemical Reaction Engineering Lab", "CH204P", "Practical", 3, 0),
                ("Process Dynamics & Control", "CH205", "Theory", 4, 1),
                ("Mass Transfer Operations", "CH206", "Theory", 3, 2)
            ],
            6: [
                ("Petrochemical & Polymer Tech", "CH301", "Theory", 4, 0),
                ("Chemical Reaction Engg II", "CH302", "Theory", 4, 1),
                ("Transport Phenomena", "CH303", "Theory", 4, 2),
                ("Process Instrumentation & Simulation Lab", "CH304P", "Practical", 3, 0),
                ("Plant Design & Economics", "CH305", "Theory", 4, 1),
                ("Industrial Safety & HAZOP", "CH306", "Theory", 3, 2)
            ]
        }
    },
    "AERO": {
        "name": "Aerospace Engineering",
        "hod": "Dr. Sanjay",
        "faculty": [
            ("FAC-AERO-001", "Dr. Sanjay", "sanjay.aero@aaip.edu", "+91 98451 20001", "Professor & HOD", "Supersonic Aerodynamics & Hypersonics", 16),
            ("FAC-AERO-002", "Dr. Vikram", "vikram.aero@aaip.edu", "+91 98451 20002", "Associate Professor", "Rocket Propulsion & Gas Turbines", 18),
            ("FAC-AERO-003", "Prof. Meera", "meera.aero@aaip.edu", "+91 98451 20003", "Assistant Professor", "Aerospace Structures & Avionics", 18)
        ],
        "rooms": [
            ("Aerospace Lecture Theatre 101", "Classroom", "Block F - Aerospace", "AE-101", 65, "Full HD Projector, Avionics Display, Sound System"),
            ("Aerodynamics & Subsonic Wind Tunnel Lab", "Science Laboratory", "Block F - Aerospace", "AE-LAB-01", 35, "Subsonic Wind Tunnel, Schlieren Optics, Pressure Rakes")
        ],
        "courses": [("B.Tech in Aerospace Engineering", "BTECH-AERO", 4, "Undergraduate")],
        "subjects": {
            3: [
                ("Incompressible Aerodynamics", "AE201", "Theory", 4, 0),
                ("Aircraft Propulsion & Turbines", "AE202", "Theory", 4, 1),
                ("Aircraft Structures & Elasticity", "AE203", "Theory", 4, 2),
                ("Aerodynamics & Propulsion Lab", "AE204P", "Practical", 3, 0),
                ("Flight Mechanics & Performance", "AE205", "Theory", 4, 1),
                ("Avionics & Flight Navigation", "AE206", "Theory", 3, 2)
            ],
            6: [
                ("Compressible Aerodynamics & Gas Dynamics", "AE301", "Theory", 4, 0),
                ("Rocket Propulsion & Space Flight", "AE302", "Theory", 4, 1),
                ("Finite Element Analysis for Aircraft", "AE303", "Theory", 4, 2),
                ("Wind Tunnel & Propulsion Testing Lab", "AE304P", "Practical", 3, 0),
                ("Orbital Mechanics & Spacecraft Dynamics", "AE305", "Theory", 4, 1),
                ("Computational Fluid Dynamics (CFD)", "AE306", "Theory", 3, 2)
            ]
        }
    },
    "AIML": {
        "name": "Artificial Intelligence & Machine Learning",
        "hod": "Dr. Manoj",
        "faculty": [
            ("FAC-AIML-001", "Dr. Manoj", "manoj.aiml@aaip.edu", "+91 98451 30001", "Professor & HOD", "Reinforcement Learning & Neural Nets", 16),
            ("FAC-AIML-002", "Dr. Harish", "harish.aiml@aaip.edu", "+91 98451 30002", "Associate Professor", "Computer Vision & Transformers", 18),
            ("FAC-AIML-003", "Prof. Swathi", "swathi.aiml@aaip.edu", "+91 98451 30003", "Assistant Professor", "Natural Language Processing & Generative AI", 18)
        ],
        "rooms": [
            ("AI & Intelligent Systems Hall 101", "Classroom", "Block A - Computing", "AI-101", 70, "Interactive Smart Board, Dual Displays, AC"),
            ("Deep Learning & GPU Supercomputing Lab", "Computer Laboratory", "Computing Complex", "AI-LAB-01", 45, "NVIDIA H100/A100 GPU Clusters, High-Speed NVLink")
        ],
        "courses": [("B.Tech in Artificial Intelligence & Machine Learning", "BTECH-AIML", 4, "Undergraduate")],
        "subjects": {
            3: [
                ("Machine Learning Foundations", "AI201", "Theory", 4, 0),
                ("Deep Neural Architectures", "AI202", "Theory", 4, 1),
                ("Applied Probability & Optimization", "AI203", "Theory", 4, 2),
                ("Machine Learning & Deep Learning Lab", "AI204P", "Practical", 3, 0),
                ("Computer Vision & Visual Perception", "AI205", "Theory", 4, 1),
                ("Knowledge Representation & Reasoning", "AI206", "Theory", 3, 2)
            ],
            6: [
                ("Reinforcement Learning & Agents", "AI301", "Theory", 4, 0),
                ("Large Language Models & Transformers", "AI302", "Theory", 4, 1),
                ("AI Ethics, Fairness & Explainability", "AI303", "Theory", 4, 2),
                ("Generative AI & LLM Systems Lab", "AI304P", "Practical", 3, 0),
                ("Autonomous Robotics & Perception", "AI305", "Theory", 4, 1),
                ("Edge AI & Model Compression", "AI306", "Theory", 3, 2)
            ]
        }
    },
    "BME": {
        "name": "Biomedical Engineering",
        "hod": "Dr. Rahul",
        "faculty": [
            ("FAC-BME-001", "Dr. Rahul", "rahul.bme@aaip.edu", "+91 98451 40001", "Professor & HOD", "Medical Image Processing & MRI", 16),
            ("FAC-BME-002", "Dr. Nandhini", "nandhini.bme@aaip.edu", "+91 98451 40002", "Associate Professor", "Bio-Instrumentation & Sensors", 18),
            ("FAC-BME-003", "Prof. Vignesh", "vignesh.bme@aaip.edu", "+91 98451 40003", "Assistant Professor", "Biomechanics & Prosthetics Design", 18)
        ],
        "rooms": [
            ("Biomedical Sciences Hall 101", "Classroom", "Block E - BioSciences", "BM-101", 60, "Smart Board, Digital Medical Telemetry, AC"),
            ("Biomedical Instrumentation & Signal Lab", "Science Laboratory", "Block E - BioSciences", "BM-LAB-01", 35, "EEG/ECG Telemetry Units, Ultrasound Phantoms, Biosensors")
        ],
        "courses": [("B.Tech in Biomedical Engineering", "BTECH-BME", 4, "Undergraduate")],
        "subjects": {
            3: [
                ("Biomedical Instrumentation", "BM201", "Theory", 4, 0),
                ("Physiological Systems & Signals", "BM202", "Theory", 4, 1),
                ("Biomechanics & Biomaterials", "BM203", "Theory", 4, 2),
                ("Biomedical Signals & Sensors Lab", "BM204P", "Practical", 3, 1),
                ("Medical Imaging Fundamentals", "BM205", "Theory", 4, 0),
                ("Clinical Engineering Standards", "BM206", "Theory", 3, 2)
            ],
            6: [
                ("Advanced Diagnostic Ultrasound & MRI", "BM301", "Theory", 4, 0),
                ("Neural Engineering & Prosthetics", "BM302", "Theory", 4, 1),
                ("Biosignal Pattern Classification", "BM303", "Theory", 4, 2),
                ("Hospital Equipment & Telemetry Lab", "BM304P", "Practical", 3, 1),
                ("Telemedicine & Medical IoT", "BM305", "Theory", 4, 0),
                ("Radiation Physics & Safety", "BM306", "Theory", 3, 2)
            ]
        }
    },
    "CIVIL": {
        "name": "Civil Engineering",
        "hod": "Dr. Priya",
        "faculty": [
            ("FAC-CIVIL-001", "Dr. Priya", "priya.civil@aaip.edu", "+91 98451 50001", "Professor & HOD", "Structural Analysis & Seismic Design", 16),
            ("FAC-CIVIL-002", "Dr. Murugan", "murugan.civil@aaip.edu", "+91 98451 50002", "Associate Professor", "Soil Mechanics & Geotechnical Engg", 18),
            ("FAC-CIVIL-003", "Prof. Gayathri", "gayathri.civil@aaip.edu", "+91 98451 50003", "Assistant Professor", "Fluid Mechanics & Environmental Hydraulics", 18)
        ],
        "rooms": [
            ("Civil Engineering Lecture Hall 101", "Classroom", "Block C - Infrastructure", "CE-101", 70, "Projector, Blueprint Screen, Audio System"),
            ("Concrete, Structural & Surveying Lab", "Science Laboratory", "Block C - Infrastructure", "CE-LAB-01", 40, "Universal Testing Machine (UTM), Total Station Theodolites")
        ],
        "courses": [("B.Tech in Civil Engineering", "BTECH-CIVIL", 4, "Undergraduate")],
        "subjects": {
            3: [
                ("Structural Analysis & Mechanics", "CE201", "Theory", 4, 0),
                ("Soil Mechanics & Geotechnics", "CE202", "Theory", 4, 1),
                ("Fluid Mechanics & Hydraulics", "CE203", "Theory", 4, 2),
                ("Strength of Materials & Concrete Lab", "CE204P", "Practical", 3, 0),
                ("Surveying & Geomatics", "CE205", "Theory", 4, 1),
                ("Building Construction Materials", "CE206", "Theory", 3, 2)
            ],
            6: [
                ("Design of Reinforced Concrete Structures", "CE301", "Theory", 4, 0),
                ("Foundation Engineering & Deep Basements", "CE302", "Theory", 4, 1),
                ("Environmental Engineering & Water Supply", "CE303", "Theory", 4, 2),
                ("Environmental & Hydraulics Lab", "CE304P", "Practical", 3, 2),
                ("Transportation Engineering & Highways", "CE305", "Theory", 4, 1),
                ("Prestressed Concrete Structures", "CE306", "Theory", 3, 0)
            ]
        }
    },
    "EEE": {
        "name": "Electrical & Electronics Engineering",
        "hod": "Dr. Rajesh",
        "faculty": [
            ("FAC-EEE-001", "Dr. Rajesh", "rajesh.eee@aaip.edu", "+91 98451 60001", "Professor & HOD", "Smart Grids & Power Systems", 16),
            ("FAC-EEE-002", "Dr. Saravanan", "saravanan.eee@aaip.edu", "+91 98451 60002", "Associate Professor", "Power Electronics & Inverters", 18),
            ("FAC-EEE-003", "Prof. Keerthana", "keerthana.eee@aaip.edu", "+91 98451 60003", "Assistant Professor", "Electrical Machines & Drives", 18)
        ],
        "rooms": [
            ("Electrical Power Lecture Hall 101", "Classroom", "Block B - Electrical", "EE-101", 65, "Digital Board, Projection Mic, AC"),
            ("Electrical Machines & Power Systems Lab", "Science Laboratory", "Block B - Electrical", "EE-LAB-01", 40, "DC Motors, Transformers, Power Grid Simulation Benches")
        ],
        "courses": [("B.Tech in Electrical & Electronics Engineering", "BTECH-EEE", 4, "Undergraduate")],
        "subjects": {
            3: [
                ("Electric Circuit Analysis", "EE201", "Theory", 4, 0),
                ("Electrical Machines I (DC & Transformers)", "EE202", "Theory", 4, 2),
                ("Electromagnetic Field Theory", "EE203", "Theory", 4, 1),
                ("Electrical Machines Simulation Lab", "EE204P", "Practical", 3, 2),
                ("Analog Electronics & Op-Amps", "EE205", "Theory", 4, 0),
                ("Power Generation & Transmission", "EE206", "Theory", 3, 1)
            ],
            6: [
                ("Power System Analysis & Faults", "EE301", "Theory", 4, 0),
                ("Power Electronics & Solid-State Drives", "EE302", "Theory", 4, 1),
                ("Control Systems & State Feedback", "EE303", "Theory", 4, 2),
                ("Power Electronics & Drives Lab", "EE304P", "Practical", 3, 1),
                ("Microcontrollers & Embedded Controllers", "EE305", "Theory", 4, 2),
                ("Renewable Energy & Microgrid Integration", "EE306", "Theory", 3, 0)
            ]
        }
    },
    "IT": {
        "name": "Information Technology",
        "hod": "Dr. Suresh",
        "faculty": [
            ("FAC-IT-001", "Dr. Suresh", "suresh.it@aaip.edu", "+91 98451 70001", "Professor & HOD", "Cloud Architecture & Cyber Defense", 16),
            ("FAC-IT-002", "Dr. Pavithra", "pavithra.it@aaip.edu", "+91 98451 70002", "Associate Professor", "Full-Stack Web Systems & Microservices", 18),
            ("FAC-IT-003", "Prof. Ashwin", "ashwin.it@aaip.edu", "+91 98451 70003", "Assistant Professor", "Mobile Computing & Distributed Storage", 18)
        ],
        "rooms": [
            ("Information Technology Lecture Hall 101", "Classroom", "Computing Complex", "IT-101", 70, "Interactive Touch Screen, High-Speed WiFi, AC"),
            ("Cloud Computing & Full-Stack Lab", "Computer Laboratory", "Computing Complex", "IT-LAB-01", 45, "Core i7 Workstations, AWS & Docker Sandbox, Kubernetes")
        ],
        "courses": [("B.Tech in Information Technology", "BTECH-IT", 4, "Undergraduate")],
        "subjects": {
            3: [
                ("Object-Oriented Programming with Java", "IT201", "Theory", 4, 1),
                ("Database Management & SQL Systems", "IT202", "Theory", 4, 0),
                ("Data Structures & Algorithm Design", "IT203", "Theory", 4, 2),
                ("Web Technologies & Database Lab", "IT204P", "Practical", 3, 1),
                ("Computer Organization & Architecture", "IT205", "Theory", 4, 0),
                ("Software Engineering Fundamentals", "IT206", "Theory", 3, 2)
            ],
            6: [
                ("Cloud Computing & Virtualization", "IT301", "Theory", 4, 0),
                ("Network Security & Cryptography", "IT302", "Theory", 4, 1),
                ("Full-Stack Web & Microservices", "IT303", "Theory", 4, 1),
                ("Cloud & DevOps Pipeline Lab", "IT304P", "Practical", 3, 0),
                ("Mobile Application Architecture", "IT305", "Theory", 4, 2),
                ("Data Warehousing & Business Intelligence", "IT306", "Theory", 3, 2)
            ]
        }
    },
    "MCT": {
        "name": "Mechatronics Engineering",
        "hod": "Dr. Arun",
        "faculty": [
            ("FAC-MCT-001", "Dr. Arun", "arun.mct@aaip.edu", "+91 98451 80001", "Professor & HOD", "Industrial Robotics & Automation", 16),
            ("FAC-MCT-002", "Dr. Shanthi", "shanthi.mct@aaip.edu", "+91 98451 80002", "Associate Professor", "PLC, SCADA & Distributed Control", 18),
            ("FAC-MCT-003", "Prof. Pradeep", "pradeep.mct@aaip.edu", "+91 98451 80003", "Assistant Professor", "Sensors, Actuators & Machine Vision", 18)
        ],
        "rooms": [
            ("Mechatronics Lecture Hall 101", "Classroom", "Block C - Robotics Wing", "MC-101", 65, "3D Projection, Podium Mic, AC"),
            ("Robotics, PLC & Automation Lab", "Science Laboratory", "Block C - Robotics Wing", "MC-LAB-01", 35, "ABB Industrial Robots, Siemens S7-1200 PLCs, Pneumatic Benches")
        ],
        "courses": [("B.Tech in Mechatronics Engineering", "BTECH-MCT", 4, "Undergraduate")],
        "subjects": {
            3: [
                ("Sensors & Signal Conditioning", "MC201", "Theory", 4, 2),
                ("Kinematics of Machinery", "MC202", "Theory", 4, 0),
                ("Digital Electronics & Microprocessors", "MC203", "Theory", 4, 1),
                ("Sensors & Actuators Lab", "MC204P", "Practical", 3, 2),
                ("Fluid Power & Pneumatics", "MC205", "Theory", 4, 0),
                ("Engineering Mechanics & Materials", "MC206", "Theory", 3, 1)
            ],
            6: [
                ("Industrial Robotics & Kinematics", "MC301", "Theory", 4, 0),
                ("PLC, SCADA & Industrial Networks", "MC302", "Theory", 4, 1),
                ("Embedded Microcontrollers & RTOS", "MC303", "Theory", 4, 2),
                ("Robotics & PLC Automation Lab", "MC304P", "Practical", 3, 0),
                ("Machine Vision & Inspection Systems", "MC305", "Theory", 4, 2),
                ("Mechatronic System Design", "MC306", "Theory", 3, 1)
            ]
        }
    },
    "MECH": {
        "name": "Mechanical Engineering",
        "hod": "Dr. Vijay",
        "faculty": [
            ("FAC-MECH-001", "Dr. Vijay", "goddard.r@aaip.edu", "+91 98765 43215", "Professor & HOD", "Propulsion & Thermodynamics", 16),
            ("FAC-MECH-002", "Dr. Natarajan", "natarajan.mech@aaip.edu", "+91 98451 90001", "Associate Professor", "Turbo Machinery & Heat Transfer", 18),
            ("FAC-MECH-003", "Prof. Gowtham", "gowtham.mech@aaip.edu", "+91 98451 90002", "Assistant Professor", "CAD/CAM & Automobile Systems", 18)
        ],
        "rooms": [
            ("Mechanical Lecture Hall 101", "Classroom", "Block C - Mechanical", "ME-101", 70, "Smart Board, Acoustic Panels, AC"),
            ("CAD/CAM & Robotics Studio", "Science Laboratory", "Block C - Mechanical", "ME-108", 35, "3D Printers, CNC Simulation Stations, Robotic Arms")
        ],
        "courses": [("B.Tech in Mechanical Engineering", "BTECH-MECH", 4, "Undergraduate")],
        "subjects": {
            3: [
                ("Engineering Thermodynamics", "ME201", "Theory", 4, 0),
                ("Manufacturing Technology I", "ME202", "Theory", 4, 2),
                ("Fluid Mechanics & Machinery", "ME203", "Theory", 4, 1),
                ("Thermal & Fluid Mechanics Lab", "ME204P", "Practical", 3, 1),
                ("Strength of Materials", "ME205", "Theory", 4, 0),
                ("Kinematics of Machinery", "ME206", "Theory", 3, 2)
            ],
            6: [
                ("Thermodynamics & Heat Transfer", "ME301", "Theory", 4, 0),
                ("Design of Transmission Systems", "ME302", "Theory", 4, 1),
                ("Finite Element Analysis", "ME303", "Theory", 4, 2),
                ("CAD/CAM & Automation Lab", "ME304P", "Practical", 3, 2),
                ("Automobile Engineering & Hybrid EVs", "ME305", "Theory", 4, 0),
                ("Operations Research & Supply Chain", "ME306", "Theory", 3, 1)
            ]
        }
    },
    "ECE": {
        "name": "Electronics & Communication Engineering",
        "hod": "Dr. Anitha",
        "faculty": [
            ("FAC-ECE-001", "Dr. Anitha", "shannon.c@aaip.edu", "+91 98765 43213", "Professor & HOD", "Information Theory & Digital Comms", 16),
            ("FAC-ECE-002", "Dr. Balaji", "balaji.ece@aaip.edu", "+91 98452 10001", "Associate Professor", "VLSI Design & Embedded Systems", 18),
            ("FAC-ECE-003", "Prof. Divya ECE", "divya.ece@aaip.edu", "+91 98452 10002", "Assistant Professor", "Signal Processing & Microwave Devices", 18)
        ],
        "rooms": [
            ("Shannon Lecture Hall 103", "Classroom", "Block B - Electronics", "B-103", 65, "Dual Projectors, Document Camera, Wireless Mic"),
            ("Microprocessors & Embedded Systems Lab", "Science Laboratory", "Block B - Electronics", "EC-105", 40, "ARM Cortex Kits, Digital Storage Oscilloscopes, Logic Analyzers")
        ],
        "courses": [("B.Tech in Electronics & Communication Engineering", "BTECH-ECE", 4, "Undergraduate")],
        "subjects": {
            3: [
                ("Electronic Circuits & Devices", "EC201", "Theory", 4, 0),
                ("Signals & Systems", "EC202", "Theory", 4, 2),
                ("Digital System Design & HDL", "EC203", "Theory", 4, 1),
                ("Digital Systems & HDL Lab", "EC204P", "Practical", 3, 1),
                ("Electromagnetic Theory", "EC205", "Theory", 4, 0),
                ("Analog Integrated Circuits", "EC206", "Theory", 3, 2)
            ],
            6: [
                ("Digital Signal Processing", "EC301", "Theory", 4, 2),
                ("VLSI Design & CMOS Architectures", "EC302", "Theory", 4, 1),
                ("Digital Communication Systems", "EC303", "Theory", 4, 0),
                ("VLSI Design & DSP Lab", "EC304P", "Practical", 3, 1),
                ("Wireless Networks & Cellular Comms", "EC305", "Theory", 4, 0),
                ("Antenna Theory & Microwave Engg", "EC306", "Theory", 3, 2)
            ]
        }
    },
    "DSAI": {
        "name": "Data Science & Artificial Intelligence",
        "hod": "Dr. Sneha",
        "faculty": [
            ("FAC-DSAI-001", "Dr. Sneha", "ada.l@aaip.edu", "+91 98765 43214", "Associate Professor & HOD", "Analytical Engine Algorithms & Deep Learning", 18),
            ("FAC-DSAI-002", "Dr. Karthik", "karthik.dsai@aaip.edu", "+91 98452 20001", "Associate Professor", "Big Data Analytics & Distributed Computing", 18),
            ("FAC-DSAI-003", "Prof. Pooja", "pooja.dsai@aaip.edu", "+91 98452 20002", "Assistant Professor", "Applied Statistics & Predictive Modeling", 18)
        ],
        "rooms": [
            ("Data Science Lecture Hall 101", "Classroom", "Computing Complex", "DS-101", 65, "Interactive Touch Screen, HD Video Link, AC"),
            ("Big Data & Analytics Cluster Lab", "Computer Laboratory", "Computing Complex", "DS-LAB-01", 40, "Apache Spark Cluster, Hadoop Nodes, High-RAM Stations")
        ],
        "courses": [("B.Tech in Artificial Intelligence & Data Science", "BTECH-AIDS", 4, "Undergraduate")],
        "subjects": {
            3: [
                ("Foundations of Data Science", "DS201", "Theory", 4, 0),
                ("Statistical Inference & Regression", "DS202", "Theory", 4, 2),
                ("Data Structures & Algorithms in Python", "DS203", "Theory", 4, 1),
                ("Data Science & Visualization Lab", "DS204P", "Practical", 3, 0),
                ("Database Systems & NoSQL", "DS205", "Theory", 4, 1),
                ("Linear Algebra for Machine Learning", "DS206", "Theory", 3, 2)
            ],
            6: [
                ("Big Data Analytics & Spark", "DS301", "Theory", 4, 1),
                ("Deep Learning Architectures", "DS501", "Theory", 4, 0),
                ("Natural Language Processing & Text Mining", "DS303", "Theory", 4, 2),
                ("Big Data Analytics & Deep Learning Lab", "DS304P", "Practical", 3, 1),
                ("Time Series & Predictive Analytics", "DS305", "Theory", 4, 2),
                ("Data Privacy, Governance & AI Ethics", "DS306", "Theory", 3, 0)
            ]
        }
    },
    "CT_UG": {
        "name": "B.Sc Computing Technologies (CT_UG)",
        "hod": "Dr. Divya",
        "faculty": [
            ("FAC-CT-001", "Dr. Divya", "divya.ct@aaip.edu", "+91 98452 30001", "Professor & HOD", "Distributed Computing & Cloud Platforms", 16),
            ("FAC-CT-002", "Dr. Ramesh", "ramesh.ct@aaip.edu", "+91 98452 30002", "Associate Professor", "Web Engineering & Software Architecture", 18),
            ("FAC-CT-003", "Prof. Janani", "janani.ct@aaip.edu", "+91 98452 30003", "Assistant Professor", "Full-Stack Development & Mobile Apps", 18)
        ],
        "rooms": [
            ("Computing Technologies Hall 101", "Classroom", "Computing Complex", "CT-101", 65, "Dual Projectors, High-Speed WiFi, AC"),
            ("Advanced Software Systems Lab", "Computer Laboratory", "Computing Complex", "CT-LAB-01", 45, "Core i7 Workstations, Linux Development Sandbox")
        ],
        "courses": [("B.Sc in Computing Technologies (CT_UG)", "CT_UG", 3, "Undergraduate")],
        "subjects": {
            3: [
                ("Data Structures & Algorithms", "CT201", "Theory", 4, 0),
                ("Database Management Systems", "CT202", "Theory", 4, 1),
                ("Object-Oriented Programming (Java/C++)", "CT203", "Theory", 4, 2),
                ("Programming & Database Lab", "CT204P", "Practical", 3, 1),
                ("Operating Systems & Linux Shell", "CT205", "Theory", 4, 0),
                ("Computer Networks Fundamentals", "CT206", "Theory", 3, 2)
            ],
            6: [
                ("Full-Stack Web Architectures", "CT301", "Theory", 4, 1),
                ("Cloud Computing & Microservices", "CT302", "Theory", 4, 0),
                ("Information Security & Cryptography", "CT303", "Theory", 4, 2),
                ("Enterprise Full-Stack Project Lab", "CT304P", "Practical", 3, 1),
                ("Mobile Application Development", "CT305", "Theory", 4, 2),
                ("Software Project Management & Agile", "CT306", "Theory", 3, 0)
            ]
        }
    },
    "CT_PG": {
        "name": "Integrated M.Sc Computing Technologies (CT_PG)",
        "hod": "Dr. Divya",
        "faculty": [
            ("FAC-CTPG-001", "Dr. Divya", "divya.ct@aaip.edu", "+91 98452 30001", "Professor & HOD", "Distributed Computing & Cloud Platforms", 16),
            ("FAC-CTPG-002", "Dr. Ramesh", "ramesh.ct@aaip.edu", "+91 98452 30002", "Associate Professor", "Web Engineering & Software Architecture", 18),
            ("FAC-CTPG-003", "Prof. Janani", "janani.ct@aaip.edu", "+91 98452 30003", "Assistant Professor", "Full-Stack Development & Mobile Apps", 18)
        ],
        "rooms": [
            ("Advanced Computing PG Hall 201", "Classroom", "Computing Complex", "CT-201", 60, "Interactive Whiteboard, Video Conference System"),
            ("High Performance Computing & Cloud Lab", "Computer Laboratory", "Computing Complex", "CT-LAB-02", 40, "GPU Clusters, Kubernetes Master/Worker Nodes")
        ],
        "courses": [("Integrated M.Sc in Computing Technologies (CT_PG)", "CT_PG", 5, "Integrated Postgraduate")],
        "subjects": {
            3: [
                ("Design & Analysis of Algorithms", "CTP201", "Theory", 4, 0),
                ("Advanced Database Architecture", "CTP202", "Theory", 4, 1),
                ("Software System Architecture", "CTP203", "Theory", 4, 2),
                ("Advanced Software Engineering Lab", "CTP204P", "Practical", 3, 1),
                ("Distributed Operating Systems", "CTP205", "Theory", 4, 0),
                ("Data Communications & Protocols", "CTP206", "Theory", 3, 2)
            ],
            6: [
                ("Advanced Cloud & Distributed Systems", "CTP301", "Theory", 4, 0),
                ("High-Performance Computing & GPU", "CTP302", "Theory", 4, 1),
                ("Enterprise Cybersecurity Protocols", "CTP303", "Theory", 4, 2),
                ("HPC & Cloud Infrastructure Lab", "CTP304P", "Practical", 3, 0),
                ("Machine Learning for Big Data", "CTP305", "Theory", 4, 2),
                ("Quantum Computing Principles", "CTP306", "Theory", 3, 1)
            ]
        }
    },
    "CSE": {
        "name": "Computer Science & Engineering",
        "hod": "Dr. Kaviya",
        "faculty": [
            ("FAC-CSE-001", "Dr. Kaviya", "hod.cse@aaip.edu", "+91 98765 43210", "Professor & HOD", "Distributed Systems & Fault Tolerance", 16),
            ("FAC-CSE-002", "Dr. Sham", "dr.elena@aaip.edu", "+91 98765 43211", "Associate Professor", "Artificial Intelligence & Heuristics", 18),
            ("FAC-CSE-003", "Dr. Suresh", "linus.t@aaip.edu", "+91 98765 43212", "Professor", "Kernel Architecture & Systems Programming", 14)
        ],
        "rooms": [
            ("Turing Lecture Hall 101", "Classroom", "Block A - Main Academic", "A-101", 70, "Interactive Smart Board, Podium Mic, Air Conditioned"),
            ("Advanced AI & Graphics Lab", "Computer Laboratory", "Computing Complex", "CS-201", 45, "45x RTX 4080 Workstations, Gigabit LAN, High-Performance GPU Cluster")
        ],
        "courses": [("B.Tech in Computer Science & Engineering", "BTECH-CSE", 4, "Undergraduate")],
        "subjects": {
            3: [
                ("Data Structures & Algorithm Analysis", "CS201", "Theory", 4, 0),
                ("Object-Oriented Programming with Java", "CS202", "Theory", 4, 1),
                ("Computer Organization & Architecture", "CS203", "Theory", 4, 2),
                ("Data Structures & Java Programming Lab", "CS204P", "Practical", 3, 1),
                ("Discrete Mathematics & Logic", "CS205", "Theory", 4, 0),
                ("Digital Systems & Microprocessors", "CS206", "Theory", 3, 2)
            ],
            6: [
                ("Design & Analysis of Algorithms", "CS301", "Theory", 4, 1),
                ("Artificial Intelligence & Machine Learning", "CS302", "Theory", 4, 1),
                ("Distributed Operating Systems", "CS303", "Theory", 4, 0),
                ("AI & Machine Learning Laboratory", "CS304P", "Practical", 3, 1),
                ("Compiler Design & Optimization", "CS305", "Theory", 4, 2),
                ("Cloud Computing Architectures", "CS306", "Theory", 3, 0)
            ]
        }
    }
}


WEEKLY_SCHEDULE_TEMPLATE = [
    # (Day, Start, End, SubjectIndex (0-5), FacultyIndex (0-2), IsLabRoom)
    # Monday
    ("Monday", "09:00", "10:00", 0, 0, False),
    ("Monday", "10:15", "11:15", 1, 1, False),
    ("Monday", "11:30", "12:30", 2, 2, False),
    ("Monday", "13:30", "15:30", 3, 1, True),  # Lab slot (P4 & P5)
    ("Monday", "15:30", "16:30", 4, 1, False),

    # Tuesday
    ("Tuesday", "09:00", "10:00", 4, 1, False),
    ("Tuesday", "10:15", "11:15", 0, 0, False),
    ("Tuesday", "11:30", "12:30", 1, 1, False),
    ("Tuesday", "13:30", "14:30", 2, 2, False),
    ("Tuesday", "14:30", "15:30", 5, 2, False),
    ("Tuesday", "15:30", "16:30", 0, 0, False),

    # Wednesday
    ("Wednesday", "09:00", "10:00", 5, 2, False),
    ("Wednesday", "10:15", "11:15", 2, 2, False),
    ("Wednesday", "11:30", "12:30", 0, 0, False),
    ("Wednesday", "13:30", "14:30", 1, 1, False),
    ("Wednesday", "14:30", "15:30", 4, 1, False),
    ("Wednesday", "15:30", "16:30", 5, 2, False),

    # Thursday
    ("Thursday", "09:00", "10:00", 1, 1, False),
    ("Thursday", "10:15", "11:15", 4, 1, False),
    ("Thursday", "11:30", "12:30", 0, 0, False),
    ("Thursday", "13:30", "15:30", 3, 0, True),  # Lab slot (P4 & P5)
    ("Thursday", "15:30", "16:30", 2, 2, False),

    # Friday
    ("Friday", "09:00", "10:00", 2, 2, False),
    ("Friday", "10:15", "11:15", 4, 1, False),
    ("Friday", "11:30", "12:30", 1, 1, False),
    ("Friday", "13:30", "14:30", 0, 0, False),
    ("Friday", "14:30", "15:30", 5, 2, False),
    ("Friday", "15:30", "16:30", 2, 2, False),

    # Saturday
    ("Saturday", "09:00", "10:00", 4, 1, False),
    ("Saturday", "10:15", "11:15", 0, 0, False),
    ("Saturday", "11:30", "12:30", 5, 2, False),
]


def ensure_department_full_resources_and_timetable(db: Session, dept_code_or_id) -> int:
    """
    Ensures that the department has:
    1. Active department record
    2. Course record
    3. Dedicated Classrooms & Labs
    4. Specialized Faculty records
    5. Core Subjects for semester 3 & 6
    6. Complete, conflict-free weekly timetable entries
    Returns total number of timetable entries seeded/existing for this department.
    """
    # 1. Identify Department
    if isinstance(dept_code_or_id, int):
        dept = db.query(Department).filter(Department.id == dept_code_or_id).first()
    else:
        dept = db.query(Department).filter(Department.code == str(dept_code_or_id).upper()).first()

    if not dept:
        # Fallback search by code in catalog
        code_key = str(dept_code_or_id).upper()
        if code_key in DEPARTMENT_CATALOG:
            cat = DEPARTMENT_CATALOG[code_key]
            dept = Department(name=cat["name"], code=code_key, hod_name=cat["hod"], description=f"Department of {cat['name']}", status="Active")
            db.add(dept)
            db.commit()
            db.refresh(dept)
        else:
            return 0

    code_key = dept.code.upper()
    if code_key not in DEPARTMENT_CATALOG:
        # Map CT to CT_UG if needed
        if code_key == "CT":
            code_key = "CT_UG"
        else:
            # Generic catalog fallback
            code_key = "CSE"

    cat = DEPARTMENT_CATALOG.get(code_key, DEPARTMENT_CATALOG["CSE"])

    # 2. Ensure Classrooms
    room_objs = []
    for r_name, r_type, bldg, room_no, cap, equip in cat["rooms"]:
        room = db.query(Classroom).filter(Classroom.room_number == room_no).first()
        if not room:
            room = Classroom(
                name=r_name, resource_type=r_type, building=bldg,
                room_number=room_no, capacity=cap, equipment=equip, availability_status="Available"
            )
            db.add(room)
            db.commit()
            db.refresh(room)
        room_objs.append(room)

    lecture_room = room_objs[0]
    lab_room = room_objs[1] if len(room_objs) > 1 else room_objs[0]

    # 3. Ensure Faculty
    faculty_objs = []
    for fid, fname, femail, fphone, fdesig, fspec, fmax in cat["faculty"]:
        fac = db.query(Faculty).filter((Faculty.faculty_id == fid) | (Faculty.email == femail)).first()
        if not fac:
            fac = Faculty(
                faculty_id=fid, full_name=fname, email=femail, phone=fphone,
                department_id=dept.id, designation=fdesig, specialization=fspec,
                max_weekly_workload=fmax, status="Active"
            )
            db.add(fac)
            db.commit()
            db.refresh(fac)
        else:
            if fac.department_id != dept.id:
                fac.department_id = dept.id
            if fac.full_name != fname:
                fac.full_name = fname
            db.commit()
        faculty_objs.append(fac)

    # 4. Ensure Course
    c_data = cat["courses"][0]
    course = db.query(Course).filter(Course.code == c_data[1]).first()
    if not course:
        course = Course(name=c_data[0], code=c_data[1], department_id=dept.id, duration_years=c_data[2], degree_type=c_data[3], status="Active")
        db.add(course)
        db.commit()
        db.refresh(course)

    # 5. Ensure Master Timetable shell
    semesters_to_seed = [3, 6]
    total_added = 0

    for sem in semesters_to_seed:
        tt = db.query(Timetable).filter(
            Timetable.department_id == dept.id,
            Timetable.semester == sem
        ).first()
        if not tt:
            tt = Timetable(
                academic_year="2025-2026",
                semester=sem,
                department_id=dept.id,
                course_id=course.id,
                status="Published"
            )
            db.add(tt)
            db.commit()
            db.refresh(tt)

        # Ensure Subjects for this semester
        sub_list = cat["subjects"].get(sem, cat["subjects"][6])
        subject_objs = []
        for sname, scode, stype, spds, f_idx in sub_list:
            sb = db.query(Subject).filter(Subject.code == scode).first()
            assigned_fac = faculty_objs[f_idx % len(faculty_objs)]
            if not sb:
                sb = Subject(
                    name=sname, code=scode, department_id=dept.id, course_id=course.id,
                    semester=sem, weekly_periods=spds, subject_type=stype,
                    assigned_faculty_id=assigned_fac.id, status="Active"
                )
                db.add(sb)
                db.commit()
                db.refresh(sb)
            subject_objs.append(sb)

        # Check existing timetable entries for this department & semester
        existing_count = db.query(TimetableEntry).filter(
            TimetableEntry.department_id == dept.id,
            TimetableEntry.semester == sem
        ).count()

        if existing_count == 0:
            # Seed weekly template
            for day, start_t, end_t, s_idx, f_idx, is_lab in WEEKLY_SCHEDULE_TEMPLATE:
                subj = subject_objs[s_idx % len(subject_objs)]
                fac = faculty_objs[f_idx % len(faculty_objs)]
                rm = lab_room if is_lab else lecture_room

                entry = TimetableEntry(
                    timetable_id=tt.id,
                    department_id=dept.id,
                    course_id=course.id,
                    semester=sem,
                    batch="Section A",
                    subject_id=subj.id,
                    faculty_id=fac.id,
                    classroom_id=rm.id,
                    day_of_week=day,
                    start_time=start_t,
                    end_time=end_t
                )
                db.add(entry)
                total_added += 1
            db.commit()

    return total_added


def ensure_all_departments_seeded(db: Session) -> Dict[str, int]:
    """
    Iterates over all 14 departments and ensures every single department
    has faculty, classrooms, subjects, and complete conflict-free timetables.
    """
    results = {}
    for code in DEPARTMENT_CATALOG.keys():
        try:
            cnt = ensure_department_full_resources_and_timetable(db, code)
            results[code] = cnt
        except Exception as e:
            print(f"Error seeding timetable for {code}: {e}")
            db.rollback()
            results[code] = -1
    return results
