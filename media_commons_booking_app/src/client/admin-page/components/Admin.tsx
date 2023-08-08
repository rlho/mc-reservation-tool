import React, { useState, useEffect } from 'react';

// This is a wrapper for google.script.run that lets us use promises.
import { serverFunctions } from '../../utils/serverFunctions';
import { Inputs } from '../../booking/components/FormInput';
import { SafetyTraining } from './SafetyTraining';

const ACTIVE_SHEET_ID = '1VZ-DY6o0GM5DL-v9AKkpCbF0w-xm-_T-vVUSPZph06Q';
const BOOKING_SHEET_NAME = 'bookings';
const BOOKING_STATUS_SHEET_NAME = 'bookingStatus';
const SAFTY_TRAINING_SHEET_NAME = 'safety_training_users';

type Booking = Inputs & {
  calendarEventId: string;
  email: string;
  startDate: string;
  endDate: string;
};

type BookingStatus = {
  calendarEventId: string;
  email: string;
  requestedAt: string;
  firstApprovedAt: string;
  secondApprovedAt: string;
  rejectedAt: string;
  canceledAt: string;
  checkedInAt: string;
};
const Admin = () => {
  const [bookings, setBookings] = useState([]);
  const [mappingBookings, setMappingBookings] = useState([]);
  const [mappingBookingStatuses, setMappingBookingStatuses] = useState([]);
  const [bookingStatuses, setBookingStatuses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState<Booking>();
  const [tab, setTab] = useState('bookings');

  useEffect(() => {
    fetchBookings();
    fetchBookingStatuses();
  }, []);
  useEffect(() => {
    const mappings = bookings
      .map((booking, index) => {
        if (index !== 0) {
          return mappingBookingRows(booking);
        }
      })
      .filter((booking) => booking !== undefined);
    //TODO: filter out bookings that are not in the future
    setMappingBookings(mappings);
  }, [bookings]);

  useEffect(() => {
    const mappings = bookingStatuses
      .map((bookingStatus, index) => {
        if (index !== 0) {
          return mappingBookingStatusRow(bookingStatus);
        }
      })
      .filter((booking) => booking !== undefined);
    console.log('mapping status', mappings);
    setMappingBookingStatuses(mappings);
  }, [bookingStatuses]);

  const fetchBookings = async () => {
    serverFunctions.fetchRows(BOOKING_SHEET_NAME).then((rows) => {
      console.log('booking rows', rows);
      setBookings(rows);
    });
  };

  const fetchBookingStatuses = async () => {
    serverFunctions.fetchRows('bookingStatus').then((statusRows) => {
      console.log('bookingStatuses rows', statusRows);
      setBookingStatuses(statusRows);
    });
  };

  const mappingBookingRows = (values: string[]): Booking => {
    return {
      calendarEventId: values[0],
      email: values[1],
      startDate: values[2],
      endDate: values[3],
      firstName: values[4],
      lastName: values[5],
      secondaryName: values[6],
      nNumber: values[7],
      netId: values[8],
      phoneNumber: values[9],
      department: values[10],
      role: values[11],
      sponsorFirstName: values[12],
      sponsorLastName: values[13],
      sponsorEmail: values[14],
      reservationTitle: values[15],
      reservationDescription: values[16],
      expectedAttendance: values[17],
      attendeeAffiliation: values[18],
      roomSetup: values[19],
      setupDetails: values[20],
      mediaServices: values[21],
      mediaServicesDetails: values[22],
      catering: values[23],
      cateringService: values[24],
      chartfieldInformation: values[25],
      hireSecurity: values[26],
    };
  };

  const mappingBookingStatusRow = (values: string[]): BookingStatus => {
    return {
      calendarEventId: values[0],
      email: values[1],
      requestedAt: values[2],
      firstApprovedAt: values[3],
      secondApprovedAt: values[4],
      rejectedAt: values[5],
      canceledAt: values[6],
      checkedInAt: values[7],
    };
  };

  const BookingStatusName = (id) => {
    const target = mappingBookingStatuses.filter(
      (item) => item.calendarEventId === id
    )[0];
    if (target === undefined) return 'Unknown';
    if (target.checkedInAt !== '') {
      return 'Checked In';
    } else if (target.canceledAt !== '') {
      return 'Canceled';
    } else if (target.rejectedAt !== '') {
      return 'Rejected';
    } else if (target.secondApprovedAt !== '') {
      return 'Approved';
    } else if (target.firstApprovedAt !== '') {
      return 'Pre Approved';
    } else if (target.requestedAt !== '') {
      return 'Requested';
    } else {
      return 'Unknown';
    }
  };

  const formatDate = (oldDate) => {
    const oldDateObject = new Date(oldDate);

    const year = oldDateObject.getFullYear();
    const month = String(oldDateObject.getMonth() + 1).padStart(2, '0');
    const date = String(oldDateObject.getDate()).padStart(2, '0');
    const hours = String(oldDateObject.getHours()).padStart(2, '0');
    const minutes = String(oldDateObject.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${date} ${hours}:${minutes}`;
  };
  return (
    <div className="m-10">
      <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400">
        <li className="mr-2">
          <a
            onClick={() => setTab('bookings')}
            aria-current="page"
            className={`${
              tab === 'bookings'
                ? 'inline-block p-4 text-blue-600 bg-gray-100 rounded-t-lg active dark:bg-gray-800 dark:text-blue-500'
                : 'inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300 '
            }`}
          >
            Bookings
          </a>
        </li>
        <li className="mr-2">
          <a
            onClick={() => setTab('safety_training')}
            className={`${
              tab === 'safety_training'
                ? 'inline-block p-4 text-blue-600 bg-gray-100 rounded-t-lg active dark:bg-gray-800 dark:text-blue-500'
                : 'inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300 '
            }`}
          >
            Safety Training
          </a>
        </li>
      </ul>
      {tab === 'safety_training' && <SafetyTraining />}
      {tab === 'bookings' && (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-[2500px] text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-2 py-3">
                  Action
                </th>
                <th scope="col" className="px-2 py-3">
                  Status
                </th>
                <th scope="col" className="px-2 py-3">
                  Name
                </th>
                <th scope="col" className="px-2 py-3">
                  Booking Date
                </th>
                <th scope="col" className="px-2 py-3">
                  Secondary name
                </th>
                <th scope="col" className="px-2 py-3">
                  N number
                </th>
                <th scope="col" className="px-2 py-3">
                  Net Id
                </th>
                <th scope="col" className="px-2 py-3">
                  Phone number
                </th>
                <th scope="col" className="px-2 py-3">
                  Department
                </th>
                <th scope="col" className="px-2 py-3">
                  Role
                </th>
                <th scope="col" className="px-2 py-3">
                  Sponsor name
                </th>
                <th scope="col" className="px-2 py-3">
                  Sponsor email
                </th>
                <th scope="col" className="px-2 py-3">
                  Title
                </th>
                <th scope="col" className="px-2 py-3">
                  Description
                </th>
                <th scope="col" className="px-2 py-3">
                  Expected Attendee
                </th>
                <th scope="col" className="px-2 py-3">
                  Attendee Affiliation
                </th>
                <th scope="col" className="px-2 py-3">
                  Set up
                </th>
                <th scope="col" className="px-2 py-3">
                  Media Service
                </th>
                <th scope="col" className="px-2 py-3">
                  Catering
                </th>
                <th scope="col" className="px-2 py-3">
                  Catering Service
                </th>
                <th scope="col" className="px-2 py-3">
                  Chartfield Information
                </th>
                <th scope="col" className="px-2 py-3">
                  Hire security
                </th>
              </tr>
            </thead>
            <tbody>
              {mappingBookings.map((booking, index) => {
                const status = BookingStatusName(booking.calendarEventId);
                return (
                  <tr
                    key={index}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <td className="px-2 py-4 w-20">
                      {status === 'Pre Approved' && (
                        <button
                          className="font-medium text-blue-600 dark:text-blue-500 hover:underline mx-2"
                          onClick={async () => {
                            await serverFunctions.approveBooking(
                              booking.calendarEventId
                            );
                            window.location.reload();
                          }}
                        >
                          Second Approve
                        </button>
                      )}
                      {status === 'Requested' && (
                        <button
                          className="font-medium text-blue-600 dark:text-blue-500 hover:underline mx-2"
                          onClick={async () => {
                            await serverFunctions.approveBooking(
                              booking.calendarEventId
                            );
                            window.location.reload();
                          }}
                        >
                          First Approve
                        </button>
                      )}
                      <button
                        className="font-medium text-blue-600 dark:text-blue-500 hover:underline mx-2"
                        onClick={async () => {
                          await serverFunctions.reject(booking.calendarEventId);
                          window.location.reload();
                        }}
                      >
                        Reject
                      </button>
                      <button
                        className="font-medium text-blue-600 dark:text-blue-500 hover:underline mx-2"
                        onClick={async () => {
                          await serverFunctions.cancel(booking.calendarEventId);
                          window.location.reload();
                        }}
                      >
                        Cancel
                      </button>
                      {status !== 'Checked In' && (
                        <button
                          className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                          onClick={async () => {
                            await serverFunctions.checkin(
                              booking.calendarEventId
                            );
                            window.location.reload();
                          }}
                        >
                          Check In
                        </button>
                      )}
                    </td>
                    <td className="px-2 py-4 w-24">{status}</td>
                    <td
                      scope="row"
                      className="flex items-center px-2 py-4 text-gray-900 whitespace-nowrap dark:text-white"
                    >
                      <div className="pl-3 w-full">
                        <div className="text-base font-semibold">
                          <button onClick={() => setShowModal(true)}>
                            {booking.firstName} {booking.lastName}
                          </button>
                        </div>
                        <div className="font-normal text-gray-500">
                          {booking.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-4 w-36">
                      <div className=" flex items-center flex-col">
                        <div>{formatDate(booking.startDate)}</div> <div>~</div>
                        <div>{formatDate(booking.endDate)}</div>
                      </div>
                    </td>

                    <td className="px-2 py-4 w-36">{booking.secondaryName}</td>
                    <td className="px-2 py-4 w-20">{booking.nNumber}</td>
                    <td className="px-2 py-4 w-20">{booking.netId}</td>
                    <td className="px-2 py-4 w-20">{booking.phoneNumber}</td>
                    <td className="px-2 py-4 w-36">{booking.department}</td>
                    <td className="px-2 py-4 w-20">{booking.role}</td>
                    <td className="px-2 py-4 w-24">
                      {booking.sponsorFirstName} {booking.sponsorLastName}
                    </td>
                    <td className="px-2 py-4 w-20">{booking.sponsorEmail}</td>
                    <td className="px-2 py-4 w-52 break-all">
                      {booking.reservationTitle}
                    </td>
                    <td className="px-2 py-4 w-60 break-all">
                      {booking.reservationDescription}
                    </td>
                    <td className="px-2 py-4 w-20">
                      {booking.expectedAttendance}
                    </td>
                    <td className="px-2 py-4 w-20">
                      {booking.attendeeAffiliation}
                    </td>
                    <td className="px-2 py-4 w-24">
                      {booking.roomSetup}
                      {booking.setupDetails && (
                        <>
                          <br />
                          <b>Details</b>
                          <br />
                          {booking.setupDetails}
                        </>
                      )}
                    </td>
                    <td className="px-2 py-4 w-24">
                      {booking.mediaServices}
                      {booking.mediaServicesDetails && (
                        <>
                          <br />
                          <b>Details</b>
                          <br />
                          {booking.mediaServicesDetails}
                        </>
                      )}
                    </td>
                    <td className="px-2 py-4 w-18">{booking.catering}</td>
                    <td className="px-2 py-4 w-18">
                      {booking.cateringService}
                    </td>
                    <td className="px-2 py-4 w-18">
                      {booking.chartfieldInformation}
                    </td>
                    <td className="px-2 py-4 w-18">{booking.hireSecurity}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Admin;