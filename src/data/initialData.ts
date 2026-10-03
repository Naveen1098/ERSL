import { ResearchTheme, Project, Publication, Software, DataLayer, Instrument, Person, BoxFile, AuditLog } from '../types';

export const initialThemes: ResearchTheme[] = [
  {
    id: "water-quality",
    title: "Water Quality Monitoring of Rivers and Lakes",
    description: "Our research focuses on monitoring and assessing inland surface water quality and ecological status using multi-spectral remote sensing. By analyzing optical properties and spectral signatures, we track vital indicators such as chlorophyll-a, turbidity, and suspended sediment concentrations. This work is critical for addressing toxic algal blooms, evaluating trophic states, and supporting cost-effective, timely monitoring of aquatic ecosystems facing environmental, climatic, and anthropogenic pressures.",
    image: "images/research/water-quality.jpg",
    keywords: ["Optical Remote Sensing", "Eutrophication", "Algal Blooms", "Suspended Sediment"]
  },
  {
    id: "river-morphology",
    title: "River Morphological Analysis",
    description: "We utilize multi-sensor remote sensing data, including Synthetic Aperture Radar (SAR), LiDAR, and high-resolution UAV mapping, to investigate complex river dynamics. Our methodologies allow for the automated extraction of river channel boundaries, reach segmentation, and the tracking of bank erosion and depositional patterns over time. This research provides essential insights into fluvial geomorphology, flood forecasting, and the impacts of manmade structures on river systems.",
    image: "river-morphology.png",
    keywords: ["Fluvial Geomorphology", "SAR & LiDAR", "Channel Delineation", "UAV Mapping"]
  },
  {
    id: "lake-morphology",
    title: "Lake Morphology Analysis",
    description: "Lakes and reservoirs are highly sensitive to climatic shifts and human water demands. Our lab models the spatial and temporal dynamics of lake systems by mapping shoreline fluctuations, estimating bathymetry, and tracking volumetric changes. By combining satellite earth observation with physical hydrology models, we evaluate the resilience of these water bodies to drought and analyze long-term shifts in surface water availability.",
    image: "lake-morphology.jpg",
    keywords: ["Bathymetry", "Shoreline Dynamics", "Volumetric Modeling", "Surface Water Tracking"]
  },
  {
    id: "geospatial-ai",
    title: "Artificial Intelligence for River and Lake Systems",
    description: "To handle the massive volume of modern Earth Observation data, we integrate advanced Machine Learning and Geospatial Artificial Intelligence (GeoAI) into our analytical pipelines. Our lab develops spatially transferable algorithms to automate the detection of water bodies, classify riparian land cover, and predict water quality parameters. By bridging cloud-based computing with AI, we achieve rapid, large-scale environmental analysis.",
    image: "ai-aquatic-sensing.jpg",
    keywords: ["Machine Learning", "Geospatial AI", "Automated Extraction", "Predictive Modeling"]
  }
];

export const initialProjects: Project[] = [
  {
    id: "proj-1",
    agency: "Water Research Foundation (WRF)",
    title: "Satellite and drone remote sensing models and tools for water quality monitoring and ecological assessment of freshwater resources",
    details: "PI: Hongxing Liu, co-PI: Yuehan Lu",
    link: "#"
  },
  {
    id: "proj-2",
    agency: "NASA",
    title: "Water Quality and Storage Monitoring Services for the Great Lakes Region of Eastern and Southern Africa by Integrating Multi-sensor Satellite Observations, Machine-learning Models and Cloud Computing Platform",
    details: "NASA SERVIR program (PI: Hongxing Liu)",
    link: "#"
  },
  {
    id: "proj-3",
    agency: "NASA",
    title: "River Flow Velocity, Discharge, and Channel Morphologic Data Acquisition and SWOT-enabled Sedimentation Investigation",
    details: "NASA SWOT program (PI: Hongxing Liu, co-PI: Sagy Cohen)",
    link: "#"
  },
  {
    id: "proj-4",
    agency: "CIROH",
    title: "Advancing Water Quality Monitoring and Prediction Capability of USGS NGWOS Program with Satellite and Drone Remote Sensing Technologies",
    details: "USGS (PI: Hongxing Liu, co-PIs: Sagy Cohen, Yuehan Lu)",
    link: "#"
  },
  {
    id: "proj-5",
    agency: "CIROH",
    title: "Channel roughness, morphology, bankfull discharge, and hydraulic modeling",
    details: "CIROH NOAA (PI: Sagy Cohen, co-PI: Hongxing Liu)",
    link: "#"
  },
  {
    id: "proj-6",
    agency: "CIROH",
    title: "ML-based Flexible Flood Inundation Mapping and Intercomparison Framework",
    details: "NOAA (PI: Sagy Cohen, co-PI: Hongxing Liu and others)",
    link: "#"
  },
  {
    id: "proj-7",
    agency: "CIROH",
    title: "Novel Geospatial Architecture of Channel Morphological and Hydraulic Attributes within the OWP Hydrofabrics",
    details: "NOAA (PI: Belize Lane, co-PI: Sagy Cohen, Hongxing Liu and others)",
    link: "#"
  },
  {
    id: "proj-8",
    agency: "CIROH",
    title: "Near-Real-Time Monitoring of Key Reservoir Variables by Integrating Wide-Swath SWOT Altimetry and Deep Learning Techniques",
    details: "CIROH",
    link: "#"
  },
  {
    id: "proj-9",
    agency: "CIROH",
    title: "Develop a Generic Georeferenced Reservoir Representation for Large-Scale Hydrologic Models",
    details: "PI: Ximing Cai",
    link: "#"
  },
  {
    id: "proj-10",
    agency: "CIROH",
    title: "Modeling River Sediment Concentration and Load in the NextGEN framework: Integrating Spaceborne Remote Sensing Technologies and Deep-learning Techniques",
    details: "CIROH",
    link: "#"
  }
];

export const initialPublications: Publication[] = [
  {
    id: "pub-1",
    title: "RS‐FloodXDepth: Enhancing remote sensing‐derived flood extent and estimating flood depth using a hydrologically guided region‐growing method and high‐resolution DEMs",
    authors: "D Tian, H Liu, L Wang, S Cohen, T Mandal",
    venue: "Water Resources Research 62 (6), e2025WR042384",
    year: 2026,
    type: "Peer-Reviewed Article",
    link: "https://doi.org/10.1029/2025WR042384",
    abstract: "Modeling shoreline dynamics and predictive modeling of flood extent, river depth, and volumetric tracking of surface water tracking using region-growing models.",
    keywords: ["Surface Water Tracking", "Predictive Modeling", "Bathymetry"]
  },
  {
    id: "pub-2",
    title: "Wide-Swath SWOT Altimetry Integration for Shoreline Dynamics and Volumetric Bathymetry Modeling of Reservoirs",
    authors: "J Seo, H Liu, S Cohen",
    venue: "Journal of Hydrology 612, 128210",
    year: 2026,
    type: "Peer-Reviewed Article",
    link: "https://doi.org/10.1016/j.jhydrol.2026.128210",
    abstract: "A hydrographic investigation integrating wide-swath satellite altimetry to track shoreline dynamics, volumetric modeling, and bathymetric changes over continental-scale reservoirs.",
    keywords: ["Bathymetry", "Shoreline Dynamics", "Volumetric Modeling", "Surface Water Tracking"]
  },
  {
    id: "pub-3",
    title: "Spatially Transferable Machine Learning and Optical Remote Sensing Models for Chlorophyll-a and Turbidity Eutrophication Assessment",
    authors: "E Miliutina, H Liu, T Mandal",
    venue: "Remote Sensing 17 (3), 452",
    year: 2025,
    type: "Peer-Reviewed Article",
    link: "https://doi.org/10.3390/rs17030452",
    abstract: "Development of predictive machine learning models to track eutrophication, toxic algal blooms, and suspended sediment concentration using optical remote sensing across inland water resources.",
    keywords: ["Optical Remote Sensing", "Eutrophication", "Algal Blooms", "Suspended Sediment", "Machine Learning", "Geospatial AI"]
  },
  {
    id: "pub-4",
    title: "Deep Learning Estimation of Riverine Suspended Sediment Concentration from Multi-Source Satellite Remote Sensing",
    authors: "N Purushothaman, H Liu, D Tian, T Mandal",
    venue: "ISPRS Journal of Photogrammetry and Remote Sensing 204, 112-128",
    year: 2025,
    type: "Peer-Reviewed Article",
    link: "https://doi.org/10.1016/j.isprsjprs.2025.02.015",
    abstract: "A data-fusion framework combining PlanetScope, Sentinel-2, and Landsat satellite imagery using deep neural networks to estimate river suspended sediment transport.",
    keywords: ["Deep Learning", "Sediment Concentration", "Remote Sensing", "GeoAI"]
  },
  {
    id: "pub-5",
    title: "Estuarine Salinity and Dissolved Oxygen Dynamics Derived from Sentinel-3 OLCI and Geospatial AI",
    authors: "A Palaparthi, H Liu, D Tian",
    venue: "Remote Sensing of Environment 301, 113940",
    year: 2025,
    type: "Peer-Reviewed Article",
    link: "https://doi.org/10.1016/j.rse.2025.113940",
    abstract: "Physics-guided deep learning framework mapping temporal and spatial variations in Mobile Bay estuarine water quality.",
    keywords: ["Sentinel-3 OLCI", "Estuarine Hydrology", "Salinity", "Geospatial AI"]
  },
  {
    id: "pub-6",
    title: "Automated Basin-Scale River Reach Delineation and Segmentation using Sentinel-1 SAR & LiDAR and SAM2 Deep Learning Foundation Model",
    authors: "T Mandal, H Liu, S Cohen, D Tian, L Wang",
    venue: "AGU Fall Meeting 2025, New Orleans, LA",
    year: 2025,
    type: "Conference",
    link: "",
    abstract: "An automated extraction and river channel delineation framework utilizing high-resolution Sentinel-1 synthetic aperture radar SAR & LiDAR imagery coupled with deep foundation models.",
    keywords: ["SAR & LiDAR", "Channel Delineation", "Automated Extraction", "UAV Mapping"]
  },
  {
    id: "pub-7",
    title: "Global River Bathymetry Inversion and Storage Capacity Estimation using SWOT Altimetry and Deep Learning",
    authors: "H Liu, J Seo, S Cohen, D Tian",
    venue: "Journal of Hydrology 635, 131102",
    year: 2024,
    type: "Peer-Reviewed Article",
    link: "https://doi.org/10.1016/j.jhydrol.2024.131102",
    abstract: "A satellite remote sensing framework combining wide-swath altimetry with physics-informed deep learning to invert sub-surface channel bathymetry and reservoir storage capacities globally.",
    keywords: ["SWOT Altimetry", "Bathymetry", "Deep Learning", "Hydrology"]
  },
  {
    id: "pub-8",
    title: "High-Resolution Flood Inundation Modeling using UAV Multispectral Photogrammetry and LiDAR DEM Integration",
    authors: "H Liu, L Wang, T Mandal, N Purushothaman",
    venue: "Photogrammetric Engineering & Remote Sensing 90 (4), 215-228",
    year: 2024,
    type: "Peer-Reviewed Article",
    link: "https://doi.org/10.14358/PERS.23-00042",
    abstract: "High-accuracy reach-scale hydraulic modeling leveraging drone LiDAR point clouds and high-resolution DEMs for rapid flood risk assessment across Southeastern river corridors.",
    keywords: ["UAV LiDAR", "DEM Integration", "Flood Modeling", "Photogrammetry"]
  },
  {
    id: "pub-9",
    title: "Remote Sensing of Inland Water Quality: Sentinel-2 & Landsat-9 Data Fusion for Suspended Sediment & Chlorophyll Inversion",
    authors: "H Liu, E Miliutina, D Tian, S Cohen",
    venue: "IEEE Transactions on Geoscience and Remote Sensing 62, 4401215",
    year: 2024,
    type: "Peer-Reviewed Article",
    link: "https://doi.org/10.1109/TGRS.2024.3361215",
    abstract: "Multi-sensor data fusion framework for high-frequency estimation of inland water turbidity, suspended sediment loads, and chlorophyll-a concentrations.",
    keywords: ["Data Fusion", "Sentinel-2", "Landsat-9", "Water Quality"]
  },
  {
    id: "pub-10",
    title: "Mapping Arctic Lake Ice Thickness Dynamics using Sentinel-1 C-Band SAR Synthetic Aperture Radar Backscatter",
    authors: "H Liu, L Wang, J Seo",
    venue: "Remote Sensing of Environment 295, 113680",
    year: 2023,
    type: "Peer-Reviewed Article",
    link: "https://doi.org/10.1016/j.rse.2023.113680",
    abstract: "Time-series microwave SAR backscatter modeling to retrieve ice growth dynamics and grounded ice extent in Arctic and sub-Arctic freshwater lakes.",
    keywords: ["SAR Backscatter", "Lake Ice", "Arctic Hydrology", "Sentinel-1"]
  }
];

export const initialSoftware: Software[] = [
  {
    id: 'soft-1',
    title: 'Automated River Segmentation Tools (ARST)',
    description: 'A comprehensive Python package designed to extract precise river channel boundaries, centerlines, and morphological attributes from multispectral Sentinel-2 and high-resolution UAV imagery. Includes automated cloud, shadow, and vegetation masking.',
    link: 'https://github.com/ersl-ua/river-segmentation-tools',
    language: 'Python'
  },
  {
    id: 'soft-2',
    title: 'Spatial Change-Point Detection (SCPD)',
    description: 'An R library implementing advanced statistical algorithms (such as Pruned Exact Linear Time - PELT, and Multi-Response Permutation Procedures - MRPP) for identifying sudden spatial and temporal shifts in complex multi-dimensional environmental and hydrologic datasets.',
    link: 'https://github.com/ersl-ua/spatial-change-point',
    language: 'R'
  }
];

export const initialDataLayers: DataLayer[] = [
  {
    id: "data-1",
    name: "Mobile River Basin - Optical & SAR Satellite Imagery",
    description: "Preprocessed Sentinel-1, Landsat, and high-resolution PlanetScope data used for continuous monitoring of river morphology.",
    availability: "Public Archive",
    link: "#"
  },
  {
    id: "data-2",
    name: "Riparian Zone UAV Multispectral Collections",
    description: "Ultra-high-resolution aerial imagery collected during seasonal field surveys across riparian zones. Includes raw and orthomosaiced outputs.",
    availability: "Upon Request",
    link: "mailto:hongxing.liu@ua.edu"
  },
  {
    id: "data-3",
    name: "In-Situ Hydrological Data (2025-2026)",
    description: "ADCP discharge measurements and water quality sensor logs from the Mobile River Basin field campaigns.",
    availability: "Data Repository",
    link: "#"
  },
  {
    id: "data-4",
    name: "Automated River Channel Masks",
    description: "Derived water masks utilizing our hierarchical slope-based classification methodology on high-resolution DEMs.",
    availability: "Internal Use Only",
    link: "#"
  }
];

export const initialInstruments: Instrument[] = [
  {
    id: "inst-1",
    name: "Sentera 6X Pro Multispectral Sensor",
    category: "Aerial Sensor",
    image: "sentera.jpg",
    description: "A high-resolution multispectral sensor used for mapping vegetation health, crop conditions, and water constituents across diverse landscapes."
  },
  {
    id: "inst-2",
    name: "Headwall Hyperspectral Sensor with Integrated LiDAR",
    category: "Aerial Sensor",
    image: "headwall-lidar.png",
    description: "An advanced airborne sensing system combining hyperspectral imaging and LiDAR to simultaneously capture spectral information and high-resolution 3D terrain data."
  },
  {
    id: "inst-3",
    name: "MicaSense Multispectral Sensor",
    category: "Aerial Sensor",
    image: "micasense.webp",
    description: "A lightweight multispectral sensor used for precision agriculture, vegetation health monitoring, environmental research, and ecosystem analysis."
  },
  {
    id: "inst-4",
    name: "FLIR Duo Pro R",
    category: "Aerial Sensor",
    image: "flir duo pro-r.jpg",
    description: "A radiometric thermal camera capable of capturing accurate surface temperature measurements for environmental monitoring, infrastructure inspection, and research applications."
  },
  {
    id: "inst-5",
    name: "FLIR E4 Thermal Camera",
    category: "Handheld Sensor",
    image: "flir-e4.jpg",
    description: "A handheld thermal imaging camera used for field inspections, equipment diagnostics, environmental studies, and infrastructure assessments."
  },
  {
    id: "inst-6",
    name: "Acoustic Doppler Current Profiler (ADCP)",
    category: "Hydrology",
    image: "adcp.jpg",
    description: "Utilized for precise in-situ discharge quantification, velocity profiling, flow measurements, and bathymetric surveys in rivers, streams, and estuaries."
  },
  {
    id: "inst-7",
    name: "YSI Multi-Parameter Water Quality Sonde",
    category: "Hydrology",
    image: "ysi.jpeg",
    description: "Deployed for continuous monitoring and spot-checking of physical and chemical water properties including pH, dissolved oxygen, conductivity, turbidity, and temperature."
  },
  {
    id: "inst-8",
    name: "RS5 River Survey System",
    category: "Hydrology",
    image: "rs5.jpg",
    description: "A shallow-water acoustic river survey system used for measuring water discharge, flow velocity, depth, and bathymetry. Designed for hydrologic surveys in rivers and streams where conventional ADCP systems may be limited."
  },
  {
    id: "inst-9",
    name: "Astro Max Drone",
    category: "UAV Platforms",
    image: "astro-max.jpg",
    description: "A professional unmanned aerial vehicle (UAV) designed for autonomous mapping, environmental monitoring, and remote sensing missions."
  },
  {
    id: "inst-10",
    name: "DJI Matrice 600",
    category: "UAV Platforms",
    image: "matrice-600.jpg",
    description: "A heavy-lift UAV platform capable of carrying advanced payloads such as hyperspectral sensors, LiDAR systems, thermal cameras, and multispectral imaging equipment."
  },
  {
    id: "inst-11",
    name: "DJI Phantom Drone",
    category: "UAV Platforms",
    image: "phantom.png",
    description: "A compact aerial platform widely used for photogrammetry, aerial imaging, site inspections, mapping, and environmental monitoring."
  },
  {
    id: "inst-12",
    name: "HYCAT Autonomous Surface Vehicle",
    category: "ASV Platforms",
    image: "hycat.webp",
    description: "An autonomous surface vehicle designed for hydrographic surveying, water quality monitoring, bathymetric mapping, and environmental data collection. It supports the integration of multiple sensors to perform autonomous missions across rivers, lakes, reservoirs, and coastal waters."
  },
  {
    id: "inst-13",
    name: "Inflatable Survey Boat",
    category: "Marine Platforms",
    image: "inflatable-boat.jpg",
    description: "A portable inflatable boat designed for deploying field instruments, collecting water samples, conducting hydrographic surveys, and accessing shallow waterways."
  },
  {
    id: "inst-14",
    name: "Research Boat",
    category: "Marine Platforms",
    image: "research-boat.jpg",
    description: "A dedicated field research vessel used for hydrographic surveys, water quality monitoring, sensor deployment, and aquatic ecosystem investigations."
  }
];

export const initialPeople: Person[] = [
  {
    id: "person-liu",
    name: "Dr. Hongxing Liu",
    role: "Professor, Director of Environmental Remote Sensing Laboratory",
    researchFocus: "Inland Water Remote Sensing, GeoAI, Satellite Hydrology and Cryosphere Monitoring",
    bio: "Dr. Liu is a Professor and the Director of the Environmental Remote Sensing Lab at The University of Alabama. He serves as PI on multiple projects supported by NASA, NOAA, CIROH, and USGS. His research centers on developing novel mathematical algorithms, machine learning, deep learning and AI models to map and model aquatic corridors, river and reservoir dynamics, and surface water quality using remote sensing technologies.",
    email: "hongxing.liu@ua.edu",
    scholar: "https://scholar.google.com/citations?user=GN_fGecAAAAJ&hl=en",
    linkedin: "",
    image: "/images/people/liu.jpg"
  },
  {
    id: "person-tian",
    name: "Dr. Dan Tian",
    role: "Research Scientist",
    researchFocus: "Flood Inundation and Depth Mapping, Hydrologic Modeling and Water Remote Sensing",
    bio: "Dr. Tian specializes in flood extent and depth mapping using Sentinel SAR data, high-resolution digital elevation models (DEMs), and hydrologically guided region-growing models.",
    email: "dtian1@ua.edu",
    scholar: "",
    linkedin: "",
    image: "/images/people/tian.jpg"
  },
  {
    id: "person-purushothaman",
    name: "Dr. Naveenkumar Purushothaman",
    role: "Post Doctoral Researcher",
    researchFocus: "Deep learning, Remote Sensing for Water and Soil Quality Monitoring",
    bio: "Dr. Purushothaman's research focusing on developing deep learning models for estimate riverine sediment concentration using remote sensing techniques and data-fusion for multi-sensor satellites using GeoAI.",
    email: "npurushothaman@ua.edu",
    scholar: "",
    linkedin: "",
    image: "/images/people/Naveen.JPG"
  },
  {
    id: "person-miliutina",
    name: "Ekaterina Miliutina",
    role: "PhD Candidate",
    researchFocus: "Optical Remote Sensing, Water Quality Monitoring, Ecological and Geospatial Modeling, GeoAI",
    bio: "Ms. Miliutina's research integrates remote sensing and machine learning to monitor inland surface water quality and ecological status. She develops transferable models for water quality and trophic state assessment across lakes and reservoirs in the United States and Africa.",
    email: "emiliutina@crimson.ua.edu",
    scholar: "https://nam11.safelinks.protection.outlook.com/?url=https%3A%2F%2Fscholar.google.com%2Fcitations%3Fhl%3Den%26user%3DNKmvVn8AAAAJ%26pagesize%3D80%26view_op%3Dlist_works%26sortby%3Dpubdate&data=05%7C02%7Ctmandal%40crimson.ua.edu%7C99538eca4013423f8dd508deddf2fe78%7C2a00728ef0d040b4a4e8ce433f3fbca7%7C0%7C0%7C639192232918922083%7CUnknown%7CTWFpbGZsb3d8eyJFbXB0eU1hcGkiOnRydWUsIlYiOiIwLjAuMDAwMCIsIlAiOiJXaW4zMiIsIkFOIjoiTWFpbCIsIldUIjoyfQ%3D%3D%7C0%7C%7C%7C&sdata=HDiro8Rn6mBnNyrAj5aQcs25dIrzT%2BriLHhw0EHuz9g%3D&reserved=0",
    linkedin: "https://nam11.safelinks.protection.outlook.com/?url=http%3A%2F%2Fwww.linkedin.com%2Fin%2Fekaterina-miliutina-62a2753a0&data=05%7C02%7Ctmandal%40crimson.ua.edu%7C99538eca4013423f8dd508deddf2fe78%7C2a00728ef0d040b4a4e8ce433f3fbca7%7C0%7C0%7C639192232918972621%7CUnknown%7CTWFpbGZsb3d8eyJFbXB0eU1hcGkiOnRydWUsIlYiOiIwLjAuMDAwMCIsIlAiOiJXaW4zMiIsIkFOIjoiTWFpbCIsIldUIjoyfQ%3D%3D%7C0%7C%7C%7C&sdata=8n3D9V7g6EvkK%2BeVpbCtWvIVHePsdxHdC1o%2BMnR2gM8%3D&reserved=0",
    image: "/images/people/miliutina.jpeg"
  },
  {
    id: "person-palaparthi",
    name: "Anindya Palaparthi",
    role: "PhD Candidate",
    researchFocus: "Remote sensing for coastal and estuarine water quality monitoring, ocean color, Sentinel-3 OLCI, satellite-derived salinity, dissolved oxygen, geospatial AI, deep learning, estuarine hydrology",
    bio: "My research focuses on developing remote sensing and deep learning approaches for monitoring water quality in coastal and estuarine environments. By integrating satellite observations from sensors such as Sentinel-3 OLCI with in-situ water quality measurements, bathymetry, temperature, and environmental variables, I investigate spatial and temporal patterns of key water quality parameters, including salinity and dissolved oxygen. My work applies machine learning, deep learning, and physics-guided modeling techniques to improve the estimation of water quality conditions in dynamic estuarine systems such as Mobile Bay. The goal of my research is to support large-scale, long-term monitoring of coastal water quality and improve understanding of estuarine responses to freshwater inflow, marine exchange, and environmental change.",
    email: "apalaparthi@crimson.ua.edu",
    scholar: "",
    linkedin: "",
    image: "/images/people/palaparthi.jpeg"
  },
  {
    id: "person-seo",
    name: "Jihee Seo",
    role: "PhD Candidate",
    researchFocus: "Remote sensing for reservoir monitoring, SWOT (Surface Water and Ocean Topography), Satellite altimetry, SAR (Synthetic Aperture Radar), Geospatial AI, Hydrology",
    bio: "My research focuses on developing remote sensing approaches for large-scale reservoir monitoring and water resource management. By integrating Synthetic Aperture Radar (SAR), optical satellite imagery, and satellite altimetry with deep learning techniques, I investigate changes in reservoir water extent, elevation, and storage across the contiguous United States. My goal is to improve long-term monitoring of reservoirs and support sustainable water resource management using various satellite data.",
    email: "jseo9@crimson.ua.edu",
    scholar: "https://nam11.safelinks.protection.outlook.com/?url=https%3A%2F%2Fscholar.google.com%2Fcitations%3Fhl%3Den%26user%3D5RuSy-sAAAAJ&data=05%7C02%7Ctmandal%40crimson.ua.edu%7Ce4dc86c5fc7b4153162d08deddf7e079%7C2a00728ef0d040b4a4e8ce433f3fbca7%7C0%7C0%7C639192253929242536%7CUnknown%7CTWFpbGZsb3d8eyJFbXB0eU1hcGkiOnRydWUsIlYiOiIwLjAuMDAwMCIsIlAiOiJXaW4zMiIsIkFOIjoiTWFpbCIsIldUIjoyfQ%3D%3D%7C0%7C%7C%7C&sdata=Up5WtPgfh3IlUTlYfi8ezDsX6pOOuo5WXu%2Fm7LFfvno%3D&reserved=0",
    linkedin: "https://nam11.safelinks.protection.outlook.com/?url=http%3A%2F%2Fwww.linkedin.com%2Fin%2Fjihee-seo-589828358&data=05%7C02%7Ctmandal%40crimson.ua.edu%7Ce4dc86c5fc7b4153162d08deddf7e079%7C2a00728ef0d040b4a4e8ce433f3fbca7%7C0%7C0%7C639192253929286899%7CUnknown%7CTWFpbGZsb3d8eyJFbXB0eU1hcGkiOnRydWUsIlYiOiIwLjAuMDAwMCIsIlAiOiJXaW4zMiIsIkFOIjoiTWFpbCIsIldUIjoyfQ%3D%3D%7C0%7C%7C%7C&sdata=KHJT3hstPuNdLdhHGzmCo7%2F9fhFzwFNBMCK%2Fpmjwj%2FA%3D&reserved=0",
    image: "/images/people/seo.jpg"
  },
  {
    id: "person-mandal",
    name: "Tantu Mandal",
    role: "PhD Student",
    researchFocus: "Fluvial geomorphology, automated extraction of river channel boundaries, and geospatial programming.",
    bio: "Utilizes multi-sensor remote sensing data and advanced spatial data analysis to investigate river dynamics in the Mobile River Basin. Licensed drone pilot experienced in high-resolution UAV mapping.",
    email: "tmandal@crimson.ua.edu",
    scholar: "https://scholar.google.com/citations?user=yvs3xBsAAAAJ&hl=en",
    linkedin: "https://www.linkedin.com/in/tantu-mandal-00426b258/",
    image: "/images/people/Tantu.jpg"
  },
  {
    id: "person-raju",
    name: "Saravanan Raju",
    role: "Research Assistant",
    researchFocus: "SAR super-resolution, Reservoir monitoring Timeseries, Computer Vision Morphology",
    bio: "Saravanan research applies deep learning to satellite remote sensing for water resource monitoring. In one strand, I develop an optical-guided super-resolution pipeline that upscales Sentinel-1 SAR imagery from 10m to 3m for flood boundary detection, using PlanetScope imagery as a training-time teacher while keeping SAR-only inference for cloud-covered events. In a second strand, I build an automated reservoir-monitoring workflow that segments and tracks water boundaries across Sentinel-1, Sentinel-2, and Landsat time series using SAM2/SAM2-HQ mask propagation, followed by geospatial correction, quality control, and area time-series analysis",
    email: "sraju1@crimson.ua.edu",
    scholar: "",
    linkedin: "https://www.linkedin.com/in/raju-saravanan/",
    image: "/images/people/Saravanan.jpg"
  }
];

export const initialBoxFiles: BoxFile[] = [
  {
    id: 'box-root-1',
    name: 'Mobile River Field Surveys 2025-2026',
    type: 'folder',
    updatedAt: '2026-06-15 14:32',
    updatedBy: 'Dr. Naveenkumar Purushothaman',
    parentId: null
  },
  {
    id: 'box-root-2',
    name: 'NASA SERVIR Research Papers',
    type: 'folder',
    updatedAt: '2026-07-02 09:15',
    updatedBy: 'Tantu Mandal',
    parentId: null
  },
  {
    id: 'box-root-3',
    name: 'NOAA CIROH Datasets',
    type: 'folder',
    updatedAt: '2026-07-10 11:45',
    updatedBy: 'Dr. Hongxing Liu',
    parentId: null
  },
  {
    id: 'box-root-4',
    name: 'ERSL_Hydrology_Water_Quality_Map.png',
    type: 'file',
    size: '12.4 MB',
    updatedAt: '2026-04-10 16:20',
    updatedBy: 'Ekaterina Miliutina',
    parentId: null,
    tags: ['Water Quality', 'Optical Remote Sensing']
  },
  
  // Field Surveys 2025 folder children
  {
    id: 'box-child-1',
    name: 'ADCP_Discharge_Mobile_River_2025.csv',
    type: 'file',
    size: '14.8 MB',
    updatedAt: '2025-10-24 15:30',
    updatedBy: 'Dr. Naveenkumar Purushothaman',
    parentId: 'box-root-1',
    tags: ['ADCP', 'Raw Data', 'Discharge']
  },
  {
    id: 'box-child-2',
    name: 'UAV_Multispectral_Ground_Control_Points.xlsx',
    type: 'file',
    size: '340 KB',
    updatedAt: '2025-11-02 11:10',
    updatedBy: 'Tantu Mandal',
    parentId: 'box-root-1',
    tags: ['GPS', 'RTK', 'UAV']
  },
  {
    id: 'box-child-3',
    name: 'Sentera_6X_Drone_Survey_SOP.pdf',
    type: 'file',
    size: '1.5 MB',
    updatedAt: '2025-05-12 09:00',
    updatedBy: 'Dr. Hongxing Liu',
    parentId: 'box-root-1',
    tags: ['SOP', 'Manual']
  },

  // Manuscripts children
  {
    id: 'box-child-4',
    name: 'African_Great_Lakes_WaterQuality_v4.docx',
    type: 'file',
    size: '8.2 MB',
    updatedAt: '2026-07-08 17:40',
    updatedBy: 'Ekaterina Miliutina',
    parentId: 'box-root-2',
    tags: ['NASA', 'Draft', 'Water Quality']
  },
  {
    id: 'box-child-5',
    name: 'Figure_1_Study_Area_Mobile_Bay_OLCI.tif',
    type: 'file',
    size: '45.1 MB',
    updatedAt: '2026-07-01 10:25',
    updatedBy: 'Anindya Palaparthi',
    parentId: 'box-root-2',
    tags: ['Figure', 'GIS', 'TIFF']
  },

  // NOAA CIROH children
  {
    id: 'box-child-6',
    name: 'RS_FloodXDepth_Weights.h5',
    type: 'file',
    size: '128.4 MB',
    updatedAt: '2026-07-09 13:12',
    updatedBy: 'Dr. Dan Tian',
    parentId: 'box-root-3',
    tags: ['AI Model', 'Weights', 'Deep Learning']
  },
  {
    id: 'box-child-7',
    name: 'Flood_Inundation_Mobile_Basin_SAM2.geojson',
    type: 'file',
    size: '18.4 MB',
    updatedAt: '2026-07-10 11:40',
    updatedBy: 'Dr. Hongxing Liu',
    parentId: 'box-root-3',
    tags: ['Vector', 'GeoJSON', 'CIROH']
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-07-11 08:02',
    userId: 'user-purushothaman',
    userName: 'Dr. Naveenkumar Purushothaman',
    action: 'UPLOAD_FILE',
    target: 'ADCP_Discharge_Mobile_River_2025.csv in Box'
  },
  {
    id: 'log-2',
    timestamp: '2026-07-10 11:45',
    userId: 'user-liu',
    userName: 'Dr. Hongxing Liu',
    action: 'UPDATE_DATALAYER',
    target: 'Automated River Channel Masks description'
  },
  {
    id: 'log-3',
    timestamp: '2026-07-09 13:12',
    userId: 'user-tian',
    userName: 'Dr. Dan Tian',
    action: 'UPLOAD_MODEL',
    target: 'RS_FloodXDepth_Weights.h5'
  }
];
