// District Committee API
export interface DistrictCommitteeMember {
  DistrictDesignation: string
  name: string
  ClubName: string
  MobileNumber: string
  BloodGroup: string
  Bloodgrp: string
  MailID: string
  Address: string
  DOB: string
  DOA: string
  RotaryID: string
  img: string
  SpouseName: string
  SpousePhoto: string
  SpouseDOB: string
  Spouse_DOB: string
  Spouse_Mobile_Number: string
  SpouseMobileNumber: string
  SpouseMobile: string
  Keywords: string
  classification: string
  fk_District_sub_Committee_id?: string
}

export interface CommitteeCategory {
  Fk_DistrictCommitteeID: string
  name: string
}

export interface DistrictCommitteeResult {
  members: DistrictCommitteeMember[]
  categories: CommitteeCategory[]
}

// Committee Details API
export interface SubCommittee {
  pk_District_sub_Committee_id: string
  name: string
}

export interface CommitteeDetailsResult {
  district_sub_Committee: SubCommittee[]
  district_sub_Committee_Details_list: DistrictCommitteeMember[]
  districtCommitteeWithoutCatList: DistrictCommitteeMember[]
}

// Club Details API (Get_Clubs_BOD_Details)
export interface ClubBasicInfo {
  Club_Name: string
  Club_ID: string
  Charter_Date: string
  Membership: string
  Address?: string
  Meeting_Time?: string
  Meeting_Day?: string
  Club_Address?: string
}

export interface ClubPresident {
  President_name: string
  President_photo: string
  Mobile_number: string
  President_DOB: string
  President_EmialID: string
  DOA: string
  address: string
  RotaryID: string
  Classification: string
  President_spouse_name: string
  President_spouse_DOB: string
  President_photo_spouse: string
}

export interface ClubSecretary {
  Secretary_name: string
  Secretary_photo: string
  Mobile_number: string
  Secretary_DOB: string
  Secretary_EmialID: string
  DOA: string
  address: string
  RotaryID: string
  Classification: string
  Secretary_spouse_name: string
  Secretary_spouse_DOB: string
  Secretary_photo_spouse: string
}

export interface ClubBODMember {
  Name: string
  Designation: string
  ClubName: string
  Mobile_number: string
  member_date_of_birth: string
  member_date_of_wedding: string
  Emailid: string
  address: string
  member_profile_photo_path: string
}

export interface ClubAG {
  Name: string
  Designation: string
  Mobile_number: string
  Emailid: string
  member_date_of_birth: string
  Zone_No?: string
  ZoneNo?: string
}

export interface ClubDetailsData {
  basicInfo: ClubBasicInfo
  ag: ClubAG | null
  president: ClubPresident | null
  secretary: ClubSecretary | null
  bod: ClubBODMember[]
  presidentPhoto: string
}

// Club Members API
export interface ClubMember {
  memberName: string
  MemberName: string
  membermobile: string
  MemberMobile: string
  designation: string
  Designation: string
  pic: string
  groupName: string
  MemberDOB: string
  MemberDOA: string
  MemberEmail: string
  MemberAddress: string
  SpouseName: string
  SpouseDOB: string
  SpousePhoto: string
  SpouseMobile: string
}

// Clubs BOD API (Get_Clubs_BOD)
export interface ClubBODSummary {
  grpID: string
  clubId: string
  clubName: string
  AG_Name: string
  AG_MobileNumber: string
  AG_EmailID: string
  AG_DOB: string
  AG_Photo: string
  President_member_name: string
  President_member_email_id: string
  President_member_mobile_no: string
  President_Classification: string
  President_Profile_Photo: string
  President_Spouse_member_name: string
  President_Spouse_DOB: string
  President_Spouse_Profile_Photo: string
  Secreatary_member_name: string
  Secreatary_email_id: string
  Secreatary_mobile_no: string
  Secreatary_Classification: string
  Secreatary_Profile_Photo: string
  Secreatary_Spouse_member_name: string
  Secreatary_Spouse_DOB: string
  Secreatary_Spouse_Profile_Photo: string
}

// Color palettes (shared constants)
export const CARD_BODY_COLORS = ['#372616', '#E59E2C', '#2F4366', '#2F5755'] as const
export const CARD_HEADER_COLORS = ['#E8D8CE', '#FFE8C4', '#8D9FBE', '#88BAB5'] as const
export const COMMITTEE_COLORS = ['#372616', '#2F4366', '#E59E2C', '#17458F'] as const

export const DESIGNATION_MAP: Record<string, string> = {
  ZAC: 'Zonal Avenue Chair',
  GAH: 'Group Avenue Head',
  ZCC: 'Zonal Co-Chair',
  ZDC: 'Zonal District Chair',
}
