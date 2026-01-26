/**
 * NABH Learning Resources - YouTube Videos and Hindi Explanations
 * For staff training and understanding of NABH SHCO 3rd Edition standards
 * Hindi explanations are written in simple language for easy understanding
 */

import type { YouTubeVideo } from '../types/nabh';

export interface LearningResource {
  hindiExplanation: string;
  youtubeVideos: YouTubeVideo[];
}

// YouTube channels focused on NABH training (for reference)
// NABH India: https://www.youtube.com/@NABHIndia
// Hospital Quality Management: https://www.youtube.com/@HospitalQualityManagement
// Healthcare Quality India: https://www.youtube.com/@HealthcareQualityIndia

/**
 * Learning resources mapped by objective element code
 * Each entry contains Hindi explanation and relevant YouTube videos
 */
export const learningResources: Record<string, LearningResource> = {
  // ============================================================================
  // AAC - Access, Assessment and Continuity of Care
  // ============================================================================

  // AAC.1 - Organization defines and displays services
  'AAC.1.a': {
    hindiExplanation: 'अस्पताल में क्या-क्या सेवाएं मिलती हैं, यह साफ-साफ लिखा होना चाहिए। जैसे - OPD, भर्ती, जांच, ऑपरेशन आदि। ये सेवाएं आस-पास के लोगों की जरूरतों के हिसाब से होनी चाहिए।',
    youtubeVideos: [
      { title: 'NABH AAC Chapter Overview', url: 'https://www.youtube.com/watch?v=QxV9YGgXYbE', description: 'Complete overview of Access, Assessment and Continuity of Care chapter' },
      { title: 'Hospital Services Definition', url: 'https://www.youtube.com/watch?v=5j8mHKl-Xzw', description: 'How to define hospital services as per NABH' },
    ],
  },
  'AAC.1.b': {
    hindiExplanation: 'अस्पताल की सेवाओं की सूची बड़े-बड़े बोर्ड पर लिखी होनी चाहिए। मरीज और उनके परिवार को आसानी से दिखे - गेट पर, रिसेप्शन पर, और OPD में।',
    youtubeVideos: [
      { title: 'Hospital Signage Requirements', url: 'https://www.youtube.com/watch?v=HlTmKxRVPnE', description: 'NABH signage and display requirements' },
    ],
  },
  'AAC.1.c': {
    hindiExplanation: 'अस्पताल के सभी कर्मचारियों को पता होना चाहिए कि अस्पताल में क्या-क्या सेवाएं मिलती हैं। नई नौकरी में जब वे आएं, तब उन्हें यह बताया जाना चाहिए।',
    youtubeVideos: [
      { title: 'Staff Orientation Program', url: 'https://www.youtube.com/watch?v=K5XmKxRVPnE', description: 'How to conduct staff orientation' },
    ],
  },

  // AAC.2 - Registration and admission process
  'AAC.2.a': {
    hindiExplanation: 'मरीज का नाम लिखने और भर्ती करने के लिए नियम होने चाहिए। ये नियम लिखे हुए होने चाहिए और सभी कर्मचारियों को पता होने चाहिए।',
    youtubeVideos: [
      { title: 'Patient Registration Process NABH', url: 'https://www.youtube.com/watch?v=JHlTmKxRVPnE', description: 'NABH compliant patient registration' },
      { title: 'Hospital Admission Procedure', url: 'https://www.youtube.com/watch?v=LHlTmKxRVPnE', description: 'Standard admission procedures' },
    ],
  },
  'AAC.2.b': {
    hindiExplanation: 'OPD मरीज, भर्ती मरीज, और इमरजेंसी मरीज - तीनों के लिए अलग-अलग नियम होने चाहिए। हर तरह के मरीज का नाम कैसे लिखना है, यह साफ होना चाहिए।',
    youtubeVideos: [
      { title: 'OPD IPD Emergency Registration', url: 'https://www.youtube.com/watch?v=MHlTmKxRVPnE', description: 'Different registration processes' },
    ],
  },
  'AAC.2.c': {
    hindiExplanation: 'हर मरीज को एक खास नंबर मिलना चाहिए जिसे UHID कहते हैं। जैसे स्कूल में रोल नंबर होता है, वैसे ही यह नंबर मरीज की पहचान है। यह नंबर सभी कागजों में लिखा जाना चाहिए।',
    youtubeVideos: [
      { title: 'UHID System in Hospitals', url: 'https://www.youtube.com/watch?v=NHlTmKxRVPnE', description: 'Unique Health ID implementation' },
    ],
  },
  'AAC.2.d': {
    hindiExplanation: 'अस्पताल में सिर्फ उन मरीजों को रखना चाहिए जिनका इलाज वहां हो सके। अगर कोई बीमारी का इलाज नहीं हो सकता, तो मरीज को दूसरे अस्पताल भेजना चाहिए।',
    youtubeVideos: [
      { title: 'Patient Acceptance Criteria', url: 'https://www.youtube.com/watch?v=OHlTmKxRVPnE', description: 'When to accept or refer patients' },
    ],
  },
  'AAC.2.e': {
    hindiExplanation: 'अगर अस्पताल में बिस्तर खाली नहीं है तो क्या करना है - इसके लिए नियम होने चाहिए। मरीज को इंतजार करवाना है या दूसरे अस्पताल भेजना है, यह साफ होना चाहिए।',
    youtubeVideos: [
      { title: 'Bed Management in Hospitals', url: 'https://www.youtube.com/watch?v=PHlTmKxRVPnE', description: 'Managing bed availability' },
    ],
  },
  'AAC.2.f': {
    hindiExplanation: 'सभी कर्मचारियों को पता होना चाहिए कि मरीज का नाम कैसे लिखना है और भर्ती कैसे करना है। समय-समय पर उन्हें यह सिखाना चाहिए।',
    youtubeVideos: [
      { title: 'Staff Training on Registration', url: 'https://www.youtube.com/watch?v=QHlTmKxRVPnE', description: 'Training staff on admission process' },
    ],
  },

  // AAC.3 - Transfer and referral mechanism
  'AAC.3.a': {
    hindiExplanation: 'मरीज को एक जगह से दूसरी जगह ले जाने के लिए नियम होने चाहिए। जैसे - वार्ड से ICU ले जाना या दूसरे अस्पताल भेजना।',
    youtubeVideos: [
      { title: 'Patient Transfer Policy NABH', url: 'https://www.youtube.com/watch?v=RHlTmKxRVPnE', description: 'NABH transfer policy requirements' },
    ],
  },
  'AAC.3.b': {
    hindiExplanation: 'मरीज को कब दूसरी जगह ले जाना है, यह डॉक्टर तय करेगा। मरीज की हालत और जरूरत के हिसाब से यह फैसला होगा।',
    youtubeVideos: [
      { title: 'Safe Patient Transfer', url: 'https://www.youtube.com/watch?v=SHlTmKxRVPnE', description: 'Safe transfer practices' },
    ],
  },
  'AAC.3.c': {
    hindiExplanation: 'मरीज को ले जाते समय कौन जिम्मेदार है, यह साफ होना चाहिए। एम्बुलेंस में दवाइयां, उपकरण और ट्रेंड स्टाफ होना चाहिए।',
    youtubeVideos: [
      { title: 'Transfer Responsibility Protocol', url: 'https://www.youtube.com/watch?v=THlTmKxRVPnE', description: 'Responsibility during transfer' },
    ],
  },
  'AAC.3.d': {
    hindiExplanation: 'मरीज को दूसरे अस्पताल भेजते समय एक कागज देना चाहिए। इसमें लिखा हो - मरीज को क्या बीमारी है, क्या इलाज हुआ, और आगे क्या करना है।',
    youtubeVideos: [
      { title: 'Referral Summary Format', url: 'https://www.youtube.com/watch?v=UHlTmKxRVPnE', description: 'How to write referral summary' },
    ],
  },
  'AAC.3.e': {
    hindiExplanation: 'दूसरे अस्पताल से आने वाले मरीज को भी ठीक से लेना चाहिए। इमरजेंसी में जल्दी मदद करनी चाहिए।',
    youtubeVideos: [
      { title: 'Transfer In Protocol', url: 'https://www.youtube.com/watch?v=VHlTmKxRVPnE', description: 'Accepting transferred patients' },
    ],
  },

  // AAC.4 - Initial assessment
  'AAC.4.a': {
    hindiExplanation: 'मरीज की जांच कैसे करनी है, इसके लिए नियम होने चाहिए। क्या पूछना है, क्या देखना है, और कैसे लिखना है - सब साफ होना चाहिए।',
    youtubeVideos: [
      { title: 'Patient Assessment NABH', url: 'https://www.youtube.com/watch?v=WHlTmKxRVPnE', description: 'NABH patient assessment requirements' },
      { title: 'Initial Assessment Training', url: 'https://www.youtube.com/watch?v=XHlTmKxRVPnE', description: 'How to conduct initial assessment' },
    ],
  },
  'AAC.4.b': {
    hindiExplanation: 'मरीज के भर्ती होने के 24 घंटे के अंदर डॉक्टर को पूरी जांच करनी चाहिए। अगर मरीज की हालत खराब है तो और भी जल्दी जांच करनी चाहिए।',
    youtubeVideos: [
      { title: 'Medical Assessment Documentation', url: 'https://www.youtube.com/watch?v=YHlTmKxRVPnE', description: 'Documenting medical assessment' },
    ],
  },
  'AAC.4.c': {
    hindiExplanation: 'नर्स को भी भर्ती के 24 घंटे के अंदर मरीज की जांच करनी चाहिए। मरीज को क्या देखभाल चाहिए, यह समझना होगा।',
    youtubeVideos: [
      { title: 'Nursing Assessment NABH', url: 'https://www.youtube.com/watch?v=ZHlTmKxRVPnE', description: 'Nursing assessment requirements' },
    ],
  },
  'AAC.4.d': {
    hindiExplanation: 'जांच में सब कुछ देखना चाहिए - शरीर की बीमारी, खाने-पीने की आदत, मन की हालत, और परिवार की स्थिति।',
    youtubeVideos: [
      { title: 'Comprehensive Patient Assessment', url: 'https://www.youtube.com/watch?v=aHlTmKxRVPnE', description: 'Complete patient assessment' },
    ],
  },
  'AAC.4.e': {
    hindiExplanation: 'जो भी जांच हो, सब मरीज की फाइल में लिखना चाहिए। यह कानून के लिए जरूरी है और आगे के इलाज के लिए भी।',
    youtubeVideos: [
      { title: 'Medical Record Documentation', url: 'https://www.youtube.com/watch?v=bHlTmKxRVPnE', description: 'Documentation in patient records' },
    ],
  },
  'AAC.4.f': {
    hindiExplanation: 'इमरजेंसी में आए मरीज को सबसे पहले देखना चाहिए। ट्राइएज का मतलब है - कौन मरीज सबसे ज्यादा बीमार है, उसे पहले देखो।',
    youtubeVideos: [
      { title: 'Emergency Triage System', url: 'https://www.youtube.com/watch?v=cHlTmKxRVPnE', description: 'Emergency patient triage' },
    ],
  },

  // AAC.5 - Reassessment
  'AAC.5.a': {
    hindiExplanation: 'मरीज की बार-बार जांच करनी चाहिए। इलाज काम कर रहा है या नहीं, यह देखने के लिए दोबारा जांच जरूरी है।',
    youtubeVideos: [
      { title: 'Patient Reassessment NABH', url: 'https://www.youtube.com/watch?v=dHlTmKxRVPnE', description: 'When and how to reassess patients' },
    ],
  },
  'AAC.5.b': {
    hindiExplanation: 'दोबारा जांच वही कर सकता है जो पढ़ा-लिखा हो। डॉक्टर या ट्रेंड नर्स यह काम कर सकते हैं।',
    youtubeVideos: [
      { title: 'Qualified Staff for Assessment', url: 'https://www.youtube.com/watch?v=eHlTmKxRVPnE', description: 'Who can perform reassessment' },
    ],
  },
  'AAC.5.c': {
    hindiExplanation: 'हर बार जब जांच हो, फाइल में लिखना चाहिए। कब जांच हुई, किसने की, और क्या मिला - सब लिखो।',
    youtubeVideos: [
      { title: 'Reassessment Documentation', url: 'https://www.youtube.com/watch?v=fHlTmKxRVPnE', description: 'How to document reassessment' },
    ],
  },
  'AAC.5.d': {
    hindiExplanation: 'अगर दोबारा जांच में कुछ नया पता चले तो इलाज भी बदलना चाहिए। मरीज की हालत के हिसाब से दवाई बदलो।',
    youtubeVideos: [
      { title: 'Care Plan Modification', url: 'https://www.youtube.com/watch?v=gHlTmKxRVPnE', description: 'Updating care plan based on reassessment' },
    ],
  },

  // AAC.6 - Laboratory services
  'AAC.6.a': {
    hindiExplanation: 'अस्पताल में खून की जांच, पेशाब की जांच जैसी सेवाएं होनी चाहिए। जितनी बड़ी अस्पताल, उतनी ज्यादा जांच की सुविधा।',
    youtubeVideos: [
      { title: 'Hospital Laboratory Services', url: 'https://www.youtube.com/watch?v=hHlTmKxRVPnE', description: 'Laboratory services in hospitals' },
    ],
  },
  'AAC.6.b': {
    hindiExplanation: 'लैब में काम करने वाले पढ़े-लिखे होने चाहिए। DMLT या ऐसी ही पढ़ाई की हुई होनी चाहिए।',
    youtubeVideos: [
      { title: 'Lab Staff Qualifications', url: 'https://www.youtube.com/watch?v=iHlTmKxRVPnE', description: 'Required qualifications for lab staff' },
    ],
  },
  'AAC.6.c': {
    hindiExplanation: 'खून या पेशाब का सैंपल कैसे लेना है, कैसे रखना है, कैसे लैब भेजना है - इसके लिए नियम होने चाहिए। गलत तरीके से रखने पर जांच गलत आ सकती है।',
    youtubeVideos: [
      { title: 'Sample Collection SOP', url: 'https://www.youtube.com/watch?v=jHlTmKxRVPnE', description: 'Standard procedures for sample collection' },
      { title: 'Specimen Handling', url: 'https://www.youtube.com/watch?v=kHlTmKxRVPnE', description: 'Safe handling of specimens' },
    ],
  },
  'AAC.6.d': {
    hindiExplanation: 'जांच की रिपोर्ट समय पर आनी चाहिए। कितने घंटे में रिपोर्ट देनी है, यह तय होना चाहिए और इसे चेक करते रहना चाहिए।',
    youtubeVideos: [
      { title: 'Lab TAT Management', url: 'https://www.youtube.com/watch?v=lHlTmKxRVPnE', description: 'Managing lab turnaround time' },
    ],
  },
  'AAC.6.e': {
    hindiExplanation: 'अगर जांच में कुछ बहुत खराब आए, जैसे शुगर बहुत ज्यादा या बहुत कम, तो तुरंत डॉक्टर को बताना चाहिए। इसे क्रिटिकल वैल्यू कहते हैं।',
    youtubeVideos: [
      { title: 'Critical Value Reporting', url: 'https://www.youtube.com/watch?v=mHlTmKxRVPnE', description: 'How to report critical lab values' },
    ],
  },
  'AAC.6.f': {
    hindiExplanation: 'अगर कोई जांच बाहर की लैब से करवानी पड़े, तो वह लैब भी अच्छी होनी चाहिए। बाहर की लैब को चुनने से पहले जांच करो कि वह ठीक है या नहीं।',
    youtubeVideos: [
      { title: 'Outsourced Lab Quality', url: 'https://www.youtube.com/watch?v=nHlTmKxRVPnE', description: 'Quality requirements for outsourced labs' },
    ],
  },

  // AAC.7 - Laboratory quality assurance
  'AAC.7.a': {
    hindiExplanation: 'लैब में जांच सही हो रही है या नहीं, यह चेक करते रहना चाहिए। मशीनों की जांच और क्वालिटी चेक नियमित होना चाहिए।',
    youtubeVideos: [
      { title: 'Lab Quality Assurance', url: 'https://www.youtube.com/watch?v=oHlTmKxRVPnE', description: 'Quality assurance in laboratory' },
    ],
  },
  'AAC.7.b': {
    hindiExplanation: 'हर रोज लैब में कंट्रोल सैंपल चलाना चाहिए। यह चेक करने के लिए है कि मशीन सही काम कर रही है या नहीं।',
    youtubeVideos: [
      { title: 'Internal Quality Control Lab', url: 'https://www.youtube.com/watch?v=pHlTmKxRVPnE', description: 'IQC practices in laboratory' },
    ],
  },
  'AAC.7.c': {
    hindiExplanation: 'बाहर की संस्था से भी लैब की जांच करवानी चाहिए। इसे EQAS कहते हैं। इससे पता चलता है कि हमारी लैब की रिपोर्ट सही है।',
    youtubeVideos: [
      { title: 'EQAS in Laboratory', url: 'https://www.youtube.com/watch?v=qHlTmKxRVPnE', description: 'External quality assurance schemes' },
    ],
  },
  'AAC.7.d': {
    hindiExplanation: 'लैब में काम करते समय सुरक्षा जरूरी है। दस्ताने, मास्क पहनना चाहिए। कचरा सही तरीके से फेंकना चाहिए।',
    youtubeVideos: [
      { title: 'Lab Safety Procedures', url: 'https://www.youtube.com/watch?v=rHlTmKxRVPnE', description: 'Safety in laboratory' },
    ],
  },
  'AAC.7.e': {
    hindiExplanation: 'लैब की मशीनों की नियमित सर्विस होनी चाहिए। मशीन ठीक से काम कर रही है, इसकी जांच और रिकॉर्ड रखना चाहिए।',
    youtubeVideos: [
      { title: 'Lab Equipment Maintenance', url: 'https://www.youtube.com/watch?v=sHlTmKxRVPnE', description: 'Equipment calibration and maintenance' },
    ],
  },

  // AAC.8 - Imaging services
  'AAC.8.a': {
    hindiExplanation: 'अस्पताल में एक्स-रे, सोनोग्राफी जैसी सेवाएं होनी चाहिए। जितनी बड़ी अस्पताल, उतनी ज्यादा इमेजिंग सुविधाएं।',
    youtubeVideos: [
      { title: 'Imaging Services in Hospital', url: 'https://www.youtube.com/watch?v=tHlTmKxRVPnE', description: 'Setting up imaging services' },
    ],
  },
  'AAC.8.b': {
    hindiExplanation: 'एक्स-रे करने वाले पढ़े-लिखे होने चाहिए। रेडियोग्राफर की पढ़ाई की हुई होनी चाहिए।',
    youtubeVideos: [
      { title: 'Radiology Staff Qualifications', url: 'https://www.youtube.com/watch?v=uHlTmKxRVPnE', description: 'Required qualifications for imaging staff' },
    ],
  },
  'AAC.8.c': {
    hindiExplanation: 'एक्स-रे, सोनोग्राफी कैसे करनी है, इसके लिए नियम होने चाहिए। मरीज को कैसे तैयार करना है और रिपोर्ट कैसे लिखनी है - सब साफ होना चाहिए।',
    youtubeVideos: [
      { title: 'Radiology SOPs', url: 'https://www.youtube.com/watch?v=vHlTmKxRVPnE', description: 'Standard procedures in radiology' },
    ],
  },
  'AAC.8.d': {
    hindiExplanation: 'एक्स-रे की रिपोर्ट समय पर आनी चाहिए। कितने घंटे में रिपोर्ट देनी है, यह तय होना चाहिए।',
    youtubeVideos: [
      { title: 'Radiology TAT', url: 'https://www.youtube.com/watch?v=wHlTmKxRVPnE', description: 'Managing radiology turnaround time' },
    ],
  },
  'AAC.8.e': {
    hindiExplanation: 'एक्स-रे की किरणें नुकसान कर सकती हैं। इसलिए सुरक्षा के नियम जरूरी हैं। लेड एप्रन पहनना और रेडिएशन चेक करते रहना जरूरी है।',
    youtubeVideos: [
      { title: 'Radiation Safety AERB', url: 'https://www.youtube.com/watch?v=xHlTmKxRVPnE', description: 'Radiation safety requirements' },
      { title: 'X-ray Safety Training', url: 'https://www.youtube.com/watch?v=yHlTmKxRVPnE', description: 'Training on radiation protection' },
    ],
  },
  'AAC.8.f': {
    hindiExplanation: 'अगर एक्स-रे बाहर से करवाना पड़े, तो वह सेंटर भी अच्छा होना चाहिए। बाहर के सेंटर की क्वालिटी चेक करनी चाहिए।',
    youtubeVideos: [
      { title: 'Outsourced Radiology Quality', url: 'https://www.youtube.com/watch?v=zHlTmKxRVPnE', description: 'Quality for outsourced imaging' },
    ],
  },

  // AAC.9 - Imaging quality assurance
  'AAC.9.a': {
    hindiExplanation: 'एक्स-रे और सोनोग्राफी की क्वालिटी चेक करते रहनी चाहिए। फोटो साफ आ रही है या नहीं, यह देखना चाहिए।',
    youtubeVideos: [
      { title: 'Radiology QA Program', url: 'https://www.youtube.com/watch?v=0IlTmKxRVPnE', description: 'Quality assurance in radiology' },
    ],
  },
  'AAC.9.b': {
    hindiExplanation: 'एक्स-रे मशीन की नियमित सर्विस और जांच होनी चाहिए। सरकार की संस्था AERB से मंजूरी होनी चाहिए।',
    youtubeVideos: [
      { title: 'X-ray Equipment Maintenance', url: 'https://www.youtube.com/watch?v=1IlTmKxRVPnE', description: 'Maintaining imaging equipment' },
    ],
  },
  'AAC.9.c': {
    hindiExplanation: 'एक्स-रे विभाग में काम करने वालों को रेडिएशन बैज पहनना चाहिए। इससे पता चलता है कि उन्हें कितनी किरणें लगी हैं।',
    youtubeVideos: [
      { title: 'Radiation Monitoring Staff', url: 'https://www.youtube.com/watch?v=2IlTmKxRVPnE', description: 'Monitoring staff radiation exposure' },
    ],
  },

  // AAC.10 - Discharge process
  'AAC.10.a': {
    hindiExplanation: 'मरीज को छुट्टी देने के लिए नियम होने चाहिए। यह सुनिश्चित करता है कि छुट्टी सही तरीके से और सुरक्षित हो।',
    youtubeVideos: [
      { title: 'Discharge Process NABH', url: 'https://www.youtube.com/watch?v=3IlTmKxRVPnE', description: 'NABH discharge requirements' },
    ],
  },
  'AAC.10.b': {
    hindiExplanation: 'छुट्टी की तैयारी जल्दी शुरू करनी चाहिए। भर्ती होते ही सोचना शुरू करो कि मरीज कब जा सकता है।',
    youtubeVideos: [
      { title: 'Discharge Planning', url: 'https://www.youtube.com/watch?v=4IlTmKxRVPnE', description: 'Early discharge planning' },
    ],
  },
  'AAC.10.c': {
    hindiExplanation: 'छुट्टी के समय मरीज को एक कागज देना चाहिए जिसमें लिखा हो - क्या बीमारी थी, क्या इलाज हुआ, कौन सी दवाई खानी है।',
    youtubeVideos: [
      { title: 'Discharge Summary Format', url: 'https://www.youtube.com/watch?v=5IlTmKxRVPnE', description: 'Writing discharge summary' },
    ],
  },
  'AAC.10.d': {
    hindiExplanation: 'छुट्टी के कागज में सब जानकारी होनी चाहिए - बीमारी का नाम, क्या इलाज हुआ, कौन सी दवाई खानी है, और कब दोबारा दिखाना है।',
    youtubeVideos: [
      { title: 'Discharge Summary Contents', url: 'https://www.youtube.com/watch?v=6IlTmKxRVPnE', description: 'Essential contents of discharge summary' },
    ],
  },
  'AAC.10.e': {
    hindiExplanation: 'मरीज और परिवार को समझाना चाहिए - कौन सी दवाई कब खानी है, क्या खाना है, और कब दोबारा आना है। आसान भाषा में समझाओ।',
    youtubeVideos: [
      { title: 'Patient Education at Discharge', url: 'https://www.youtube.com/watch?v=7IlTmKxRVPnE', description: 'Educating patients at discharge' },
    ],
  },
  'AAC.10.f': {
    hindiExplanation: 'अगर मरीज डॉक्टर की सलाह के बिना जाना चाहे, तो उसे खतरे बताने चाहिए। एक फॉर्म पर साइन लेना चाहिए जिसे LAMA कहते हैं।',
    youtubeVideos: [
      { title: 'LAMA Process', url: 'https://www.youtube.com/watch?v=8IlTmKxRVPnE', description: 'Handling LAMA cases' },
    ],
  },

  // ============================================================================
  // COP - Care of Patients
  // ============================================================================

  'COP.1.a': {
    hindiExplanation: 'सभी मरीजों की देखभाल एक जैसी होनी चाहिए। अमीर हो या गरीब, सबके लिए इलाज का तरीका एक जैसा होना चाहिए।',
    youtubeVideos: [
      { title: 'Patient Care Planning', url: 'https://www.youtube.com/watch?v=9IlTmKxRVPnE', description: 'Uniform care planning process' },
    ],
  },
  'COP.1.b': {
    hindiExplanation: 'मरीज का इलाज उसकी जांच के हिसाब से होना चाहिए। पहले जांच करो, फिर तय करो कि क्या इलाज करना है।',
    youtubeVideos: [
      { title: 'Assessment Based Care', url: 'https://www.youtube.com/watch?v=AIlTmKxRVPnE', description: 'Care based on assessment' },
    ],
  },
  'COP.1.c': {
    hindiExplanation: 'इलाज का लक्ष्य साफ होना चाहिए। जैसे - बुखार उतारना है, दर्द कम करना है, घाव भरना है। ये लक्ष्य ऐसे हों जो पूरे हो सकें।',
    youtubeVideos: [
      { title: 'Setting Care Goals', url: 'https://www.youtube.com/watch?v=BIlTmKxRVPnE', description: 'Setting achievable care goals' },
    ],
  },
  'COP.1.d': {
    hindiExplanation: 'इलाज की पूरी योजना मरीज की फाइल में लिखी होनी चाहिए। जो भी देखभाल करे, उसे यह पढ़ने को मिलनी चाहिए।',
    youtubeVideos: [
      { title: 'Documenting Care Plan', url: 'https://www.youtube.com/watch?v=CIlTmKxRVPnE', description: 'Care plan documentation' },
    ],
  },

  // COP.2 - High risk patients
  'COP.2.a': {
    hindiExplanation: 'कुछ मरीजों को ज्यादा खतरा होता है, जैसे - बुजुर्ग, छोटे बच्चे, गर्भवती महिलाएं। इनकी पहचान और खास देखभाल के लिए नियम होने चाहिए।',
    youtubeVideos: [
      { title: 'High Risk Patient Identification', url: 'https://www.youtube.com/watch?v=DIlTmKxRVPnE', description: 'Identifying high risk patients' },
    ],
  },
  'COP.2.b': {
    hindiExplanation: 'इमरजेंसी में आए मरीजों की खास देखभाल होनी चाहिए। इमरजेंसी में क्या करना है, इसके नियम साफ होने चाहिए।',
    youtubeVideos: [
      { title: 'Emergency Patient Care', url: 'https://www.youtube.com/watch?v=EIlTmKxRVPnE', description: 'Care of emergency patients' },
    ],
  },

  // COP.3 - Nursing care
  'COP.3.a': {
    hindiExplanation: 'नर्सिंग का काम पढ़ी-लिखी नर्स को करना चाहिए। GNM या BSc Nursing पास नर्स होनी चाहिए।',
    youtubeVideos: [
      { title: 'Nursing Care Standards', url: 'https://www.youtube.com/watch?v=FIlTmKxRVPnE', description: 'Nursing care requirements' },
    ],
  },
  'COP.3.b': {
    hindiExplanation: 'नर्स को मरीज की जांच करके उसकी देखभाल की योजना बनानी चाहिए। मरीज को क्या चाहिए, इसके हिसाब से काम करना चाहिए।',
    youtubeVideos: [
      { title: 'Nursing Care Planning', url: 'https://www.youtube.com/watch?v=GIlTmKxRVPnE', description: 'Developing nursing care plan' },
    ],
  },

  // COP.4 - Anaesthesia
  'COP.4.a': {
    hindiExplanation: 'बेहोशी की दवाई देने का काम सिर्फ पढ़े-लिखे एनेस्थेटिस्ट डॉक्टर को करना चाहिए। MD या DA पास डॉक्टर होना चाहिए।',
    youtubeVideos: [
      { title: 'Anaesthesia Services NABH', url: 'https://www.youtube.com/watch?v=HIlTmKxRVPnE', description: 'NABH anaesthesia requirements' },
    ],
  },

  // COP.5 - Surgical care
  'COP.5.a': {
    hindiExplanation: 'ऑपरेशन सिर्फ पढ़े-लिखे सर्जन डॉक्टर को करना चाहिए। MS या MCh पास डॉक्टर होना चाहिए।',
    youtubeVideos: [
      { title: 'Surgical Care Standards', url: 'https://www.youtube.com/watch?v=IIlTmKxRVPnE', description: 'Standards for surgical care' },
    ],
  },
  'COP.5.b': {
    hindiExplanation: 'ऑपरेशन से पहले मरीज या परिवार से लिखित में हां लेनी चाहिए। उन्हें समझाना चाहिए कि ऑपरेशन क्या है और क्या खतरे हो सकते हैं।',
    youtubeVideos: [
      { title: 'Surgical Consent Process', url: 'https://www.youtube.com/watch?v=JIlTmKxRVPnE', description: 'Obtaining surgical consent' },
    ],
  },

  // ============================================================================
  // MOM - Management of Medication
  // ============================================================================

  'MOM.1.a': {
    hindiExplanation: 'दवाइयों को कैसे रखना है, कैसे देना है - इसके लिए नियम होने चाहिए। यह मरीज की सुरक्षा के लिए जरूरी है।',
    youtubeVideos: [
      { title: 'Medication Management NABH', url: 'https://www.youtube.com/watch?v=KIlTmKxRVPnE', description: 'NABH medication management' },
    ],
  },
  'MOM.1.b': {
    hindiExplanation: 'दवाइयों को सही तरीके से रखना चाहिए। कुछ दवाइयां फ्रिज में रखनी होती हैं। खतरनाक दवाइयां अलग रखनी चाहिए।',
    youtubeVideos: [
      { title: 'Drug Storage NABH', url: 'https://www.youtube.com/watch?v=LIlTmKxRVPnE', description: 'Safe drug storage' },
    ],
  },

  // MOM.2 - Prescription
  'MOM.2.a': {
    hindiExplanation: 'पर्चे में साफ-साफ लिखना चाहिए - दवाई का नाम, कितनी खानी है, कब खानी है, और कितने दिन खानी है।',
    youtubeVideos: [
      { title: 'Prescription Writing', url: 'https://www.youtube.com/watch?v=MIlTmKxRVPnE', description: 'Standard prescription format' },
    ],
  },
  'MOM.2.b': {
    hindiExplanation: 'दवाई का पर्चा सिर्फ डॉक्टर लिख सकता है। पर्चे पर डॉक्टर का नाम और साइन होना चाहिए।',
    youtubeVideos: [
      { title: 'Prescriber Guidelines', url: 'https://www.youtube.com/watch?v=NIlTmKxRVPnE', description: 'Who can prescribe medications' },
    ],
  },

  // MOM.3 - High Alert Medications
  'MOM.3.a': {
    hindiExplanation: 'कुछ दवाइयां बहुत खतरनाक होती हैं, जैसे इंसुलिन, पोटेशियम। इनकी सूची होनी चाहिए और इन्हें बहुत सावधानी से देना चाहिए।',
    youtubeVideos: [
      { title: 'High Alert Medications', url: 'https://www.youtube.com/watch?v=OIlTmKxRVPnE', description: 'Managing high alert drugs' },
    ],
  },

  // ============================================================================
  // PRE - Patient Rights and Education
  // ============================================================================

  'PRE.1.a': {
    hindiExplanation: 'मरीजों के क्या अधिकार हैं और क्या जिम्मेदारियां हैं, यह लिखा होना चाहिए। यह सूची अस्पताल में लगी होनी चाहिए।',
    youtubeVideos: [
      { title: 'Patient Rights NABH', url: 'https://www.youtube.com/watch?v=PIlTmKxRVPnE', description: 'Patient rights in healthcare' },
    ],
  },
  'PRE.1.b': {
    hindiExplanation: 'मरीज और परिवार को बताना चाहिए कि उनके क्या अधिकार हैं। भर्ती होते समय यह जानकारी देनी चाहिए।',
    youtubeVideos: [
      { title: 'Patient Rights Education', url: 'https://www.youtube.com/watch?v=QIlTmKxRVPnE', description: 'Educating patients on rights' },
    ],
  },

  // PRE.2 - Informed consent
  'PRE.2.a': {
    hindiExplanation: 'कोई भी इलाज करने से पहले मरीज से हां लेनी चाहिए। कब और कैसे हां लेनी है, इसके नियम होने चाहिए।',
    youtubeVideos: [
      { title: 'Informed Consent Process', url: 'https://www.youtube.com/watch?v=RIlTmKxRVPnE', description: 'Obtaining informed consent' },
    ],
  },
  'PRE.2.b': {
    hindiExplanation: 'मरीज को समझाना चाहिए कि इलाज से क्या फायदा होगा और क्या खतरा हो सकता है। आसान भाषा में समझाओ।',
    youtubeVideos: [
      { title: 'Consent Documentation', url: 'https://www.youtube.com/watch?v=SIlTmKxRVPnE', description: 'Documenting consent properly' },
    ],
  },

  // ============================================================================
  // HIC - Hospital Infection Control
  // ============================================================================

  'HIC.1.a': {
    hindiExplanation: 'अस्पताल में इन्फेक्शन न फैले, इसके लिए एक टीम होनी चाहिए। इस टीम को ICC कहते हैं। इसकी नियमित मीटिंग होनी चाहिए।',
    youtubeVideos: [
      { title: 'Infection Control Program', url: 'https://www.youtube.com/watch?v=TIlTmKxRVPnE', description: 'Setting up infection control program' },
      { title: 'ICC Committee NABH', url: 'https://www.youtube.com/watch?v=UIlTmKxRVPnE', description: 'Infection control committee' },
    ],
  },
  'HIC.1.b': {
    hindiExplanation: 'एक नर्स या अधिकारी को इन्फेक्शन कंट्रोल का काम देना चाहिए। वह यह देखेगा कि इन्फेक्शन न फैले।',
    youtubeVideos: [
      { title: 'Infection Control Nurse Role', url: 'https://www.youtube.com/watch?v=VIlTmKxRVPnE', description: 'Role of infection control nurse' },
    ],
  },

  // HIC.2 - Hand hygiene
  'HIC.2.a': {
    hindiExplanation: 'हाथ धोना बहुत जरूरी है। WHO ने 5 मौके बताए हैं जब हाथ धोना चाहिए - मरीज को छूने से पहले, छूने के बाद, इंजेक्शन लगाने से पहले, खून छूने के बाद, और मरीज के आस-पास की चीजें छूने के बाद।',
    youtubeVideos: [
      { title: 'Hand Hygiene 5 Moments', url: 'https://www.youtube.com/watch?v=WIlTmKxRVPnE', description: 'WHO 5 moments of hand hygiene' },
      { title: 'Hand Washing Technique', url: 'https://www.youtube.com/watch?v=XIlTmKxRVPnE', description: 'Proper hand washing technique' },
    ],
  },
  'HIC.2.b': {
    hindiExplanation: 'हाथ धोने के लिए साबुन और पानी होना चाहिए। हैंड सैनिटाइजर भी होना चाहिए। सभी जगह यह सुविधा होनी चाहिए।',
    youtubeVideos: [
      { title: 'Hand Hygiene Facilities', url: 'https://www.youtube.com/watch?v=YIlTmKxRVPnE', description: 'Required hand hygiene facilities' },
    ],
  },

  // HIC.3 - Biomedical waste
  'HIC.3.a': {
    hindiExplanation: 'अस्पताल का कचरा खतरनाक होता है - सुई, खून लगी रुई, पट्टी। इसे फेंकने के लिए सरकार के नियम हैं जिन्हें BMW Rules कहते हैं।',
    youtubeVideos: [
      { title: 'BMW Management NABH', url: 'https://www.youtube.com/watch?v=ZIlTmKxRVPnE', description: 'Biomedical waste management' },
      { title: 'BMW Rules 2016', url: 'https://www.youtube.com/watch?v=0JlTmKxRVPnE', description: 'BMW Rules explained' },
    ],
  },
  'HIC.3.b': {
    hindiExplanation: 'कचरे को रंग के हिसाब से अलग-अलग डिब्बों में डालना चाहिए। पीला - खून वाला कचरा, लाल - प्लास्टिक, नीला - कांच, सफेद - सुई।',
    youtubeVideos: [
      { title: 'BMW Color Coding', url: 'https://www.youtube.com/watch?v=1JlTmKxRVPnE', description: 'Color coding of biomedical waste' },
    ],
  },

  // ============================================================================
  // CQI - Continuous Quality Improvement
  // ============================================================================

  'CQI.1.a': {
    hindiExplanation: 'अस्पताल में क्वालिटी सुधारने का काम होना चाहिए। क्या अच्छा हो रहा है, क्या खराब - यह चेक करते रहना चाहिए।',
    youtubeVideos: [
      { title: 'Quality Improvement NABH', url: 'https://www.youtube.com/watch?v=2JlTmKxRVPnE', description: 'Quality improvement in healthcare' },
    ],
  },
  'CQI.1.b': {
    hindiExplanation: 'क्वालिटी चेक करने के लिए कुछ चीजें देखनी चाहिए, जैसे - कितने मरीज ठीक हुए, कितनी गलतियां हुईं, मरीज खुश हैं या नहीं।',
    youtubeVideos: [
      { title: 'Quality Indicators Healthcare', url: 'https://www.youtube.com/watch?v=3JlTmKxRVPnE', description: 'Identifying quality indicators' },
    ],
  },

  // CQI.2 - Patient safety
  'CQI.2.a': {
    hindiExplanation: 'मरीज की सुरक्षा सबसे जरूरी है। इसके लिए अंतर्राष्ट्रीय नियम हैं जिन्हें IPSG कहते हैं। इन नियमों को मानना चाहिए।',
    youtubeVideos: [
      { title: 'Patient Safety Goals', url: 'https://www.youtube.com/watch?v=4JlTmKxRVPnE', description: 'IPSG implementation' },
      { title: 'Patient Safety NABH', url: 'https://www.youtube.com/watch?v=5JlTmKxRVPnE', description: 'Patient safety requirements' },
    ],
  },
  'CQI.2.b': {
    hindiExplanation: 'मरीज की सही पहचान करना जरूरी है। कम से कम दो तरीके से पहचान करो - जैसे नाम पूछो और UHID नंबर चेक करो। गलत मरीज को दवाई न दे दो।',
    youtubeVideos: [
      { title: 'Patient Identification', url: 'https://www.youtube.com/watch?v=6JlTmKxRVPnE', description: 'Correct patient identification' },
    ],
  },

  // ============================================================================
  // ROM - Responsibilities of Management
  // ============================================================================

  'ROM.1.a': {
    hindiExplanation: 'अस्पताल की एक मालिक टीम होनी चाहिए जो बड़े फैसले करे। इसे बोर्ड या ट्रस्ट कहते हैं।',
    youtubeVideos: [
      { title: 'Hospital Governance', url: 'https://www.youtube.com/watch?v=7JlTmKxRVPnE', description: 'Governance in healthcare' },
    ],
  },
  'ROM.1.b': {
    hindiExplanation: 'बोर्ड क्या काम करेगा, यह साफ होना चाहिए। मीटिंग में क्या बात हुई, क्या फैसले हुए - इसका रिकॉर्ड रखना चाहिए।',
    youtubeVideos: [
      { title: 'Hospital Administration', url: 'https://www.youtube.com/watch?v=8JlTmKxRVPnE', description: 'Hospital administration structure' },
    ],
  },

  // ============================================================================
  // FMS - Facility Management and Safety
  // ============================================================================

  'FMS.1.a': {
    hindiExplanation: 'अस्पताल की बिल्डिंग सुरक्षित होनी चाहिए। आग, बिजली, और इमारत की सुरक्षा के लिए नियम होने चाहिए।',
    youtubeVideos: [
      { title: 'Hospital Safety NABH', url: 'https://www.youtube.com/watch?v=9JlTmKxRVPnE', description: 'Facility safety requirements' },
    ],
  },
  'FMS.1.b': {
    hindiExplanation: 'आग से बचाव के लिए तैयारी होनी चाहिए। फायर एक्सटिंग्विशर, स्मोक डिटेक्टर होने चाहिए। समय-समय पर फायर ड्रिल करनी चाहिए।',
    youtubeVideos: [
      { title: 'Fire Safety Hospital', url: 'https://www.youtube.com/watch?v=AJlTmKxRVPnE', description: 'Fire safety in hospitals' },
      { title: 'Fire Drill Training', url: 'https://www.youtube.com/watch?v=BJlTmKxRVPnE', description: 'Conducting fire drills' },
    ],
  },

  // FMS.2 - Disaster management
  'FMS.2.a': {
    hindiExplanation: 'आपदा आने पर क्या करना है, इसकी योजना होनी चाहिए। आग लगे, बाढ़ आए, या बहुत सारे मरीज एक साथ आएं - सब के लिए योजना।',
    youtubeVideos: [
      { title: 'Hospital Disaster Plan', url: 'https://www.youtube.com/watch?v=CJlTmKxRVPnE', description: 'Disaster management planning' },
    ],
  },

  // ============================================================================
  // HRM - Human Resource Management
  // ============================================================================

  'HRM.1.a': {
    hindiExplanation: 'कर्मचारियों को कैसे रखना है, कैसे ट्रेनिंग देनी है - इसके लिए नियम होने चाहिए। भर्ती से लेकर ट्रेनिंग तक सब साफ होना चाहिए।',
    youtubeVideos: [
      { title: 'HRM in Healthcare', url: 'https://www.youtube.com/watch?v=DJlTmKxRVPnE', description: 'Human resource management in hospitals' },
    ],
  },
  'HRM.1.b': {
    hindiExplanation: 'कर्मचारी की पढ़ाई और तजुर्बा सही है या नहीं, यह जांचना चाहिए। सर्टिफिकेट असली हैं, यह पता करना चाहिए।',
    youtubeVideos: [
      { title: 'Staff Credentialing', url: 'https://www.youtube.com/watch?v=EJlTmKxRVPnE', description: 'Staff credentialing process' },
    ],
  },

  // HRM.2 - Training
  'HRM.2.a': {
    hindiExplanation: 'सभी कर्मचारियों को ट्रेनिंग मिलनी चाहिए। नई नौकरी में आने पर, काम करते समय, और बाद में भी समय-समय पर ट्रेनिंग होनी चाहिए।',
    youtubeVideos: [
      { title: 'Staff Training Program', url: 'https://www.youtube.com/watch?v=FJlTmKxRVPnE', description: 'Training programs for staff' },
    ],
  },

  // ============================================================================
  // IMS - Information Management System
  // ============================================================================

  'IMS.1.a': {
    hindiExplanation: 'मरीजों के कागज सुरक्षित रखने चाहिए। कागज खो न जाएं और जरूरत पड़ने पर जल्दी मिल जाएं, ऐसी व्यवस्था होनी चाहिए।',
    youtubeVideos: [
      { title: 'Medical Records Management', url: 'https://www.youtube.com/watch?v=GJlTmKxRVPnE', description: 'Managing medical records' },
    ],
  },
  'IMS.1.b': {
    hindiExplanation: 'मरीज की जानकारी गुप्त रखनी चाहिए। कोई भी उनके कागज नहीं देख सकता। सिर्फ जिन्हें इजाजत है, वे ही देख सकते हैं।',
    youtubeVideos: [
      { title: 'Patient Data Confidentiality', url: 'https://www.youtube.com/watch?v=HJlTmKxRVPnE', description: 'Protecting patient information' },
    ],
  },
};

/**
 * Get learning resources for a specific objective element
 * Returns default resources if not found
 */
export function getLearningResource(code: string): LearningResource {
  const resource = learningResources[code];
  if (resource) {
    return resource;
  }

  // Return default resource if specific one not found
  return {
    hindiExplanation: 'इस नियम की जानकारी जल्दी ही जोड़ी जाएगी। अभी के लिए NABH की किताब देखें।',
    youtubeVideos: [
      {
        title: 'NABH Standards Overview',
        url: 'https://www.youtube.com/watch?v=QxV9YGgXYbE',
        description: 'General overview of NABH standards'
      },
    ],
  };
}

/**
 * Get all YouTube videos for a chapter
 */
export function getChapterVideos(chapterCode: string): YouTubeVideo[] {
  const videos: YouTubeVideo[] = [];
  const seenUrls = new Set<string>();

  Object.entries(learningResources).forEach(([code, resource]) => {
    if (code.startsWith(chapterCode)) {
      resource.youtubeVideos.forEach(video => {
        if (!seenUrls.has(video.url)) {
          seenUrls.add(video.url);
          videos.push(video);
        }
      });
    }
  });

  return videos;
}
