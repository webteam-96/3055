import type { DistrictDirectoryResponse } from '../types/api'

// Minimal but representative unified-directory payload used across tests.
// Exercises: committee aliases vs master fields, ProfilePhotoPath (leading
// slash) vs bare filename images, groups + sub-groups, and a club whose board
// includes look-alike designations ("Immediate Past President").
export const directoryFixture: DistrictDirectoryResponse = {
  district: { DistrictNumber: '3055' },
  rotaryYear: { id: 52, yearLabel: '2026-27' },
  districtCommittee: [
    {
      name: 'Naimish N. Ravani',
      committeeName: 'Naimish N. Ravani',
      district_designation: 'District Governor 2026-27',
      districtDesignation: 'District Governor 2026-27',
      ClubName: 'Ahmedabad Supreme',
      mobile: '9879688811',
      committeeMobile: '9879688811',
      email: 'dg@example.com',
      committeeEmail: 'dg@example.com',
      committeePhoto: 'DG_Photo.jpg',
      ProfilePhotoPath: null,
      BirthDate: '1970-03-14T00:00:00',
      AnniversaryDate: null,
      RotaryId: '111',
      MemberIntroduction: 'Industrialist',
    },
  ],
  groups: [
    {
      id: 200,
      groupName: 'Beta Group',
      sortOrder: 2,
      isActive: true,
      members: [],
      subGroups: [],
    },
    {
      id: 100,
      groupName: 'Alpha Group',
      sortOrder: 1,
      isActive: true,
      members: [
        {
          name: 'Direct Member',
          district_designation: 'Group Chair',
          ClubName: 'RC Alpha',
          PrimaryMobileNumber: '900000001',
          EmailId: 'direct@example.com',
          ProfilePhotoPath: '/Documents/directory/direct.jpg',
          BirthDate: '1980-05-13T00:00:00',
        },
      ],
      subGroups: [
        {
          id: 300,
          subGroupName: 'Alpha Sub',
          sortOrder: 1,
          isActive: true,
          members: [
            {
              name: 'Sub Member',
              district_designation: 'Sub Chair',
              ClubName: 'RC Sub',
              PrimaryMobileNumber: '900000002',
              EmailId: 'sub@example.com',
              ProfilePhotoPath: 'subfile.jpg',
              BirthDate: '1990-12-01T00:00:00',
            },
          ],
        },
      ],
    },
  ],
  clubs: [
    {
      club: {
        pk_club_id: 32285,
        ClubRotaryId: '85453',
        ClubName: 'Aadarsh Ahmedabad',
        ClubCharterDate: '2013-10-25T00:00:00',
        MeetingDay: 'Friday',
        MeetingAddress: 'Sports Club',
      },
      boardOfDirectorsYearId: 46,
      boardOfDirectorsYearLabel: '2025-26',
      boardOfDirectorsIsFallback: true,
      boardOfDirectors: [
        {
          id: 1,
          designationId: 1,
          designationName: 'Club President',
          designationSortOrder: 2,
          MemberName: 'Pres Person',
          ProfilePhotoPath: '/Documents/directory/pres.jpg',
          PrimaryMobileNumber: '901',
          EmailId: 'pres@example.com',
          BirthDate: '1975-01-02T00:00:00',
          RotaryId: '555',
          MemberIntroduction: 'Doctor',
        },
        {
          id: 2,
          designationId: 5,
          designationName: 'Club Secretary',
          designationSortOrder: 5,
          MemberName: 'Sec Person',
          ProfilePhotoPath: '/Documents/directory/sec.jpg',
          PrimaryMobileNumber: '902',
          EmailId: 'sec@example.com',
        },
        {
          id: 3,
          designationId: 9,
          designationName: 'Immediate Past President',
          designationSortOrder: 9,
          MemberName: 'IPP Person',
          PrimaryMobileNumber: '903',
        },
        {
          id: 4,
          designationId: 7,
          designationName: 'Club Treasurer',
          designationSortOrder: 7,
          MemberName: 'Treasurer Person',
          PrimaryMobileNumber: '904',
        },
      ],
      members: [
        { MemberName: 'Member One', PrimaryMobileNumber: '910', EmailId: 'm1@example.com', BirthDate: '1985-07-16T00:00:00' },
        { MemberName: 'Member Two', PrimaryMobileNumber: '911', EmailId: 'm2@example.com' },
      ],
    },
  ],
}
