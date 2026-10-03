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
    id: "pub-openalex-w4416726288",
    title: "It's still Hungry People and Mining – Deforestation in Kahuzi-Biega National Park - Eastern Democratic Republic of the Congo",
    authors: "Richard Allan Douglas Beck, Hongxing Liu, Song Shu, Lei Wang",
    venue: "IEEE IGARSS 2025 Symposium, 3178-3181",
    year: 2025,
    type: "Conference",
    link: "https://doi.org/10.1109/igarss55030.2025.11242804",
    abstract: "High-resolution satellite imagery, Landsat-based deforestation data products and field visits indicate that in Kahuzi-Biega National Park in the eastern Democratic Republic of the Congo deforestation is caused mostly by conversion of forested park land to agricultural fields and mining. Deforestation is worsening steadily, especially acute in the highland part of the park which is home to Grauer's gorillas.",
    keywords: ["Deforestation", "Kahuzi-Biega National Park", "Mining", "Remote Sensing"]
  },
  {
    id: "pub-openalex-w4367325834",
    title: "Unmanned Aerial Vehicle-Based Structure from Motion Technique for Precise Snow Depth Retrieval—Implication for Optimal Ground Control Point Deployment Strategy",
    authors: "Song Shu, Ok-Youn Yu, Chris Schoonover, Hongxing Liu, Bo Yang",
    venue: "Remote Sensing 15 (9), 2297",
    year: 2023,
    type: "Peer-Reviewed Article",
    link: "https://doi.org/10.3390/rs15092297",
    abstract: "Unmanned aerial vehicle (UAV)-based snow depth is mapped as the difference between snow-on and snow-off digital surface models (DSMs) derived using structure from motion (SfM) photogrammetry with ground control points (GCPs). We evaluated the impacts of GCP quality and deployment strategies on snow depth retrieval accuracy, demonstrating optimal GCP configurations in complex mountainous terrain.",
    keywords: ["UAV Photogrammetry", "Structure from Motion", "Snow Depth", "GCP Deployment"]
  },
  {
    id: "pub-openalex-w4297997886",
    title: "HMRFS–TP: long-term daily gap-free snow cover products over the Tibetan Plateau from 2002 to 2021 based on hidden Markov random field model",
    authors: "Yan Huang, Jiahui Xu, Jingyi Xu, Yelei Zhao, Bailang Yu, Hongxing Liu, Shujie Wang, Wanjia Xu, Jianping Wu, Zhaojun Zheng",
    venue: "Earth System Science Data 14 (9), 4445-4462",
    year: 2022,
    type: "Peer-Reviewed Article",
    link: "https://doi.org/10.5194/essd-14-4445-2022",
    abstract: "Snow cover plays an essential role in climate change and hydrological cycles across the Tibetan Plateau. We generate a long-term daily cloud-gap-free snow cover product at 500 m resolution applying a hidden Markov random field (HMRF) model to MODIS satellite observations, optimally integrating spectral, spatiotemporal, solar radiation, and topographic information.",
    keywords: ["Hidden Markov Random Field", "Tibetan Plateau", "Snow Cover", "MODIS Gap Filling"]
  },
  {
    id: "pub-openalex-w4225275752",
    title: "Traffic restrictions during the 2008 Olympic Games reduced urban heat intensity and extent in Beijing",
    authors: "Bo Yang, Hongxing Liu, Emily Lei Kang, Timothy L. Hawthorne, Susanna T. Y. Tong, Song Shu, Min Xu",
    venue: "Communications Earth & Environment (Nature Portfolio) 3 (1), 1-10",
    year: 2022,
    type: "Peer-Reviewed Article",
    link: "https://doi.org/10.1038/s43247-022-00427-4",
    abstract: "Satellite thermal remote sensing was utilized to examine urban heat dynamics in relation to traffic restriction policies during the 2008 Olympic Games in Beijing. Based on daily MODIS satellite observations of land surface temperature, statistical models revealed cutting traffic volume by half led to a marked decrease in mean surface temperature of 1.5–2.4 °C and shrinkage of urban heat island extent by 820 km².",
    keywords: ["Urban Heat Island", "Thermal Remote Sensing", "Traffic Restriction", "Beijing Olympics"]
  },
  {
    id: "pub-openalex-w4225473809",
    title: "Polarization in Environmental Donations: Application to Deforestation-Prevention Donation",
    authors: "Dede Long, Hongxing Liu, Rodolfo M. Nayga",
    venue: "Land Economics 99 (1), 122-140",
    year: 2022,
    type: "Peer-Reviewed Article",
    link: "https://doi.org/10.3368/le.080921-0092r",
    abstract: "Investigating polarization in environmental philanthropy and donation behaviors with empirical application to tropical and temperate deforestation-prevention initiatives, utilizing discrete choice experiment econometrics.",
    keywords: ["Environmental Economics", "Deforestation Prevention", "Donation Behavior", "Econometrics"]
  },
  {
    id: "pub-openalex-w4213339953",
    title: "Controls on Larsen C Ice Shelf Retreat From a 60-Year Satellite Data Record",
    authors: "Shujie Wang, Hongxing Liu, Kenneth C. Jezek, Richard B. Alley, Patrick Alexander, Yan Huang",
    venue: "Journal of Geophysical Research: Earth Surface 127 (3), e2021JF006346",
    year: 2022,
    type: "Peer-Reviewed Article",
    link: "https://doi.org/10.1029/2021jf006346",
    abstract: "Rapid retreat of Larsen A and B ice shelves has provided important clues about ice shelf destabilization. Utilizing multisource satellite images collected over 1963–2020, we derive multidecadal time series of ice front, flow velocities, and critical rift features of Larsen C, Antarctica. Ice-sheet modeling reveals mechanical weakening around Bawden and Gipps ice rises controlled localized rift acceleration and catastrophic iceberg calving.",
    keywords: ["Larsen C Ice Shelf", "Antarctica", "Satellite Remote Sensing", "Ice Calving Dynamics"]
  },
  {
    id: "pub-openalex-w3211093300",
    title: "Snow cover detection in mid-latitude mountainous and polar regions using nighttime light data",
    authors: "Yan Huang, Zhichao Song, Haoxuan Yang, Bailang Yu, Hongxing Liu, Tao Che, Jin Chen, Jianping Wu, Song Shu, Xiaobao Peng, Zhaojun Zheng, Jiahui Xu",
    venue: "Remote Sensing of Environment 268, 112766",
    year: 2021,
    type: "Peer-Reviewed Article",
    link: "https://doi.org/10.1016/j.rse.2021.112766",
    abstract: "Snow cover detection under cloud-free nighttime conditions was achieved across mid-latitude mountainous zones and polar regions utilizing Day/Night Band (DNB) moonlight radiance measurements from the Visible Infrared Imaging Radiometer Suite (VIIRS), filling a critical gap in conventional optical diurnal sensing.",
    keywords: ["Nighttime Lights", "VIIRS Day/Night Band", "Snow Cover Detection", "Remote Sensing"]
  },
  {
    id: "pub-openalex-w3097440068",
    title: "Evaluation of historic and operational satellite radar altimetry missions for constructing consistent long-term lake water level records",
    authors: "Song Shu, Hongxing Liu, Richard Allan Douglas Beck, Frédéric Frappart, Jean-François Crétaux, Yan Huang",
    venue: "Hydrology and Earth System Sciences 25, 1643-1670",
    year: 2021,
    type: "Peer-Reviewed Article",
    link: "https://doi.org/10.5194/hess-25-1643-2021",
    abstract: "A total of 13 satellite missions with radar altimeters have been launched since 1985. This study makes a comprehensive evaluation of historic and currently operational altimetry for lake water level retrieval across 12 lakes in four countries, establishing a rigorous two-step bias correction and normalization procedure to construct consistent multi-decadal water level time series.",
    keywords: ["Satellite Altimetry", "Radar Retracking", "Lake Water Level", "Hydrology"]
  },
  {
    id: "pub-openalex-w3131947787",
    title: "Implementation Strategy and Spatiotemporal Extensibility of Multipredictor Ensemble Model for Water Quality Parameter Retrieval With Multispectral Remote Sensing Data",
    authors: "Min Xu, Hongxing Liu, Richard Allan Douglas Beck, John Lekki, Bo Yang, Yang Liu, Song Shu, Shujie Wang, Roger P. Tokars, Robert Charles Anderson, Molly K. Reif, Erich Emery",
    venue: "IEEE Transactions on Geoscience and Remote Sensing 60, 1-16",
    year: 2021,
    type: "Peer-Reviewed Article",
    link: "https://doi.org/10.1109/tgrs.2020.3045921",
    abstract: "Due to complex optical properties of inland waters, empirical bio-optical models often fail to transfer across space and time. We develop a multipredictor ensemble modeling framework combining Sentinel-2 multispectral imagery with coincident in situ water samples. The ensemble model improves chlorophyll-a prediction accuracy by 46% and demonstrates strong spatiotemporal transferability across inland water bodies.",
    keywords: ["Multipredictor Ensemble", "Chlorophyll-a", "Sentinel-2", "IEEE TGRS"]
  },
  {
    id: "pub-openalex-w3140510101",
    title: "A spectral space partition guided ensemble method for retrieving chlorophyll-a concentration in inland waters from Sentinel-2A satellite imagery",
    authors: "Hongxing Liu, Yan Huang, Song Shu, Lei Wang",
    venue: "Journal of Great Lakes Research 47 (3), 735-748",
    year: 2021,
    type: "Peer-Reviewed Article",
    link: "https://doi.org/10.1016/j.jglr.2021.03.011",
    abstract: "An innovative ensemble learning architecture partitioning the optical spectral reflectance space into homogeneous clusters before applying specialized local regressors for accurate chlorophyll-a concentration inversion in turbid and eutrophic inland lakes from Sentinel-2 MSI data.",
    keywords: ["Spectral Space Partition", "Ensemble Method", "Chlorophyll-a", "Great Lakes"]
  },
  {
    id: "pub-openalex-w3117253212",
    title: "Spatio-temporal Cokriging method for assimilating and downscaling multi-scale remote sensing data",
    authors: "Bo Yang, Hongxing Liu, Emily Lei Kang, Song Shu",
    venue: "Remote Sensing of Environment 255, 112190",
    year: 2020,
    type: "Peer-Reviewed Article",
    link: "https://doi.org/10.1016/j.rse.2020.112190",
    abstract: "A geostatistical spatio-temporal Cokriging framework designed to assimilate coarse-resolution high-frequency satellite observations with fine-resolution low-frequency data, providing seamless downscaled geophysical parameter estimation with quantified uncertainty.",
    keywords: ["Spatio-temporal Geostatistics", "Cokriging", "Data Fusion", "Downscaling"]
  },
  {
    id: "pub-openalex-w3091807952",
    title: "Harmful Algal Bloom Characterization in Inland Lakes Using Multi-Sensor Satellite Remote Sensing and Cloud Computing on Google Earth Engine",
    authors: "Min Xu, Yang Liu, Hongxing Liu, Richard Allan Douglas Beck, Molly K. Reif, Erich Emery, Jade L. Young, Qiusheng Wu",
    venue: "Remote Sensing 12 (20), 3278",
    year: 2020,
    type: "Peer-Reviewed Article",
    link: "https://doi.org/10.3390/rs12203278",
    abstract: "Monitoring harmful algal blooms (HABs) in freshwater over regional scales has been implemented through mapping chlorophyll-a concentrations using multi-sensor satellite remote sensing. We present an automated cloud-based framework pairing surface reflectance from Landsat and Sentinel satellites with in situ water quality samples on Google Earth Engine to track cyanobacterial blooms.",
    keywords: ["Harmful Algal Blooms", "Google Earth Engine", "Inland Lakes", "Multi-Sensor Fusion"]
  },
  {
    id: "pub-openalex-w3046588404",
    title: "Improving Satellite Waveform Altimetry Measurements With a Probabilistic Relaxation Algorithm",
    authors: "Song Shu, Hongxing Liu, Frédéric Frappart, Emily Lei Kang, Richard Allan Douglas Beck",
    venue: "IEEE Transactions on Geoscience and Remote Sensing 59 (4), 3120-3135",
    year: 2020,
    type: "Peer-Reviewed Article",
    link: "https://doi.org/10.1109/tgrs.2020.3010184",
    abstract: "To enhance the vertical accuracy of satellite radar altimetry over inland lakes and rivers, a novel waveform retracking method based on probabilistic relaxation labeling is introduced, substantially reducing range noise and multi-peak waveform contamination.",
    keywords: ["Radar Waveform", "Probabilistic Relaxation", "Satellite Altimetry", "IEEE TGRS"]
  },
  {
    id: "pub-openalex-w3129374272",
    title: "Multi-Predictor Ensemble Model for River Turbidity Assessment using Landsat 8 Imagery at a Regional Scale",
    authors: "Min Xu, Hongxing Liu, Yang Liu",
    venue: "IEEE IGARSS 2020 Symposium, 4758-4761",
    year: 2020,
    type: "Conference",
    link: "https://doi.org/10.1109/igarss39084.2020.9324634",
    abstract: "This study presents a multi-predictor ensemble model to assess turbidity of dynamic river reaches in the Mobile-Tombigbee River Basin based on Landsat 8 multispectral data. The ensemble method improves turbidity prediction accuracy by 48% and exhibits superior regional spatial transferability.",
    keywords: ["Turbidity Assessment", "Ensemble Model", "Landsat 8", "River Networks"]
  },
  {
    id: "pub-openalex-w2997103215",
    title: "Analysis of lake water storage and its response to climate variations in the Tibetan Plateau using multi-mission satellite altimetry",
    authors: "Song Shu, Hongxing Liu, Frédéric Frappart, Jean-François Crétaux, Yan Huang",
    venue: "Science of The Total Environment 704, 135311",
    year: 2020,
    type: "Peer-Reviewed Article",
    link: "https://doi.org/10.1016/j.scitotenv.2019.135311",
    abstract: "Tracking continuous lake water level and volumetric storage variations across the Tibetan Plateau from multi-mission radar altimetry (Envisat, Jason-1/2/3, CryoSat-2) coupled with optical water surface delineation, revealing widespread lake expansion in response to cryospheric melting.",
    keywords: ["Tibetan Plateau", "Lake Storage", "Satellite Altimetry", "Climate Variations"]
  },
  {
    id: "pub-openalex-w2910891245",
    title: "Automated river reach extraction and width delineation from high-resolution satellite imagery",
    authors: "Hongxing Liu, Song Shu, Lei Wang",
    venue: "Water Resources Research 55 (4), 2840-2858",
    year: 2019,
    type: "Peer-Reviewed Article",
    link: "https://doi.org/10.1029/2018wr023810",
    abstract: "A robust morphological skeletonization and cross-sectional profiling algorithm for the automated, objective extraction of river channel centerlines, reach segmentation, and continuous bank-to-bank width measurements from multi-temporal optical and SAR imagery.",
    keywords: ["River Morphometry", "Width Extraction", "Channel Delineation", "Water Resources"]
  },
  {
    id: "pub-openalex-w2809190938",
    title: "Integration of LiDAR and satellite multispectral imagery for estimating river bathymetry and hydraulic geometry",
    authors: "Hongxing Liu, Lei Wang, Kenneth C. Jezek",
    venue: "Journal of Hydrology 562, 590-602",
    year: 2018,
    type: "Peer-Reviewed Article",
    link: "https://doi.org/10.1016/j.jhydrol.2018.05.028",
    abstract: "Combining airborne LiDAR topographic elevation surveys with multi-spectral satellite reflectance inversion to construct continuous high-resolution 3D bathymetric profiles and stage-discharge hydraulic geometry in ungauged river channels.",
    keywords: ["River Bathymetry", "LiDAR", "Hydraulic Geometry", "Journal of Hydrology"]
  },
  {
    id: "pub-openalex-w2768501249",
    title: "Rift Propagation and Calving Dynamics on the Larsen C Ice Shelf, Antarctica",
    authors: "Shujie Wang, Hongxing Liu, Kenneth C. Jezek",
    venue: "Geophysical Research Letters 44 (11), 5538-5545",
    year: 2017,
    type: "Peer-Reviewed Article",
    link: "https://doi.org/10.1002/2017gl073408",
    abstract: "Satellite radar and optical surveillance tracking the catastrophic rift progression across the Larsen C Ice Shelf leading to the massive A-68 iceberg calving event, analyzing fracture mechanics and suture zone structural integrity.",
    keywords: ["Rift Propagation", "Larsen C", "Iceberg Calving", "Geophysical Research Letters"]
  },
  {
    id: "pub-openalex-w2591642815",
    title: "Spatial and temporal dynamics of Arctic coastal erosion and thermokarst lake drainage using historical aerial photography and satellite imagery",
    authors: "Hongxing Liu, Richard Allan Douglas Beck, Kenneth C. Jezek",
    venue: "Remote Sensing of Environment 192, 180-194",
    year: 2017,
    type: "Peer-Reviewed Article",
    link: "https://doi.org/10.1016/j.rse.2017.02.012",
    abstract: "Decadal tracking of permafrost bluff retreat, thermal erosion, and catastrophic thermokarst lake drainage along the North Slope of Alaska utilizing ortho-rectified declassified spy satellite photography and modern satellite constellations.",
    keywords: ["Arctic Coastal Erosion", "Thermokarst Lakes", "Permafrost", "Cryosphere"]
  },
  {
    id: "pub-openalex-w2409319723",
    title: "A high-performance parallel computing algorithm for drainage network extraction from large-scale digital elevation models",
    authors: "Hongxing Liu, Lei Wang",
    venue: "Computers & Geosciences 85, 96-107",
    year: 2015,
    type: "Peer-Reviewed Article",
    link: "https://doi.org/10.1016/j.cageo.2015.09.011",
    abstract: "Designing a scalable parallel priority-flood hydrological routing algorithm utilizing domain decomposition and message passing to process continental-scale high-resolution DEMs for automated stream network delineation.",
    keywords: ["Parallel Computing", "Drainage Network", "Digital Elevation Models", "GeoAI"]
  },
  {
    id: "pub-openalex-w2161245744",
    title: "Mapping seasonal snow cover and snowmelt runoff in mountainous river basins using MODIS and Landsat data",
    authors: "Yan Huang, Hongxing Liu, Jianping Wu",
    venue: "Hydrological Processes 28 (15), 4410-4424",
    year: 2014,
    type: "Peer-Reviewed Article",
    link: "https://doi.org/10.1002/hyp.9950",
    abstract: "Integrating high-temporal MODIS daily snow coverage with Landsat spatial details into a temperature-index snowmelt runoff model (SRM) to forecast springtime discharge in snowmelt-dominated high-elevation catchments.",
    keywords: ["Snowmelt Runoff", "Mountain Hydrology", "MODIS", "Snow Water Equivalent"]
  },
  {
    id: "pub-openalex-w2042026335",
    title: "An accurate and automated algorithm for water body delineation from Landsat imagery",
    authors: "Hongxing Liu, Kenneth C. Jezek",
    venue: "Photogrammetric Engineering & Remote Sensing 70 (6), 719-727",
    year: 2004,
    type: "Peer-Reviewed Article",
    link: "https://doi.org/10.14358/pers.70.6.719",
    abstract: "A landmark foundational algorithm formulating adaptive thresholding and morphological filtering for the precise, unsupervised delineation of surface water bodies, shorelines, and wetlands from multi-spectral satellite imagery.",
    keywords: ["Water Extraction", "Automated Delineation", "Shoreline Mapping", "PERS"]
  },
  {
    id: "pub-openalex-w2007723148",
    title: "Scale issues and multiscale representations in digital terrain analysis and geomorphometry",
    authors: "Hongxing Liu, Kenneth C. Jezek",
    venue: "International Journal of Geographical Information Science 18 (2), 163-185",
    year: 2004,
    type: "Peer-Reviewed Article",
    link: "https://doi.org/10.1080/13658810310001620924",
    abstract: "Theoretical and empirical analysis of spatial resolution, terrain roughness, and scale-dependent topographic parameter calculation (slope, aspect, curvature, and contributing area) from digital elevation data.",
    keywords: ["Geomorphometry", "Scale Issues", "Digital Terrain Analysis", "IJGIS"]
  },
  {
    id: "pub-openalex-w1995945562",
    title: "Investigation of Antarctica ice sheet surface topography and flow velocity using RADARSAT-1 SAR interferometry",
    authors: "Kenneth C. Jezek, Hongxing Liu, Frank Carsey",
    venue: "Journal of Geophysical Research: Solid Earth 107 (B12), 2374",
    year: 2002,
    type: "Peer-Reviewed Article",
    link: "https://doi.org/10.1029/2001jb000441",
    abstract: "First continental-scale radar backscatter and interferometric mosaic of the Antarctic Ice Sheet derived from the Antarctic Mapping Mission using RADARSAT-1 Synthetic Aperture Radar (SAR), establishing baseline ice stream velocities.",
    keywords: ["RADARSAT-1 SAR", "Antarctica Ice Sheet", "Interferometry", "Glaciology"]
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
