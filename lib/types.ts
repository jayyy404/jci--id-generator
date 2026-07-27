export interface Delegate {
  delegateId: string;
  firstName: string;
  lastName: string;
  preferredName: string;
  chapterName: string;
  photoUrl: string;
  tshirtSize: string;
  phoneNumber: string;
  kitConfirmed: boolean;
}

// Full row shape returned by the password-gated admin endpoint — keys match
// the PortalDelegates sheet's header names exactly (see apps-script/doGet.gs
// rowToObject), not the camelCase public Delegate shape above. PaymentStatus
// is computed server-side (handleAdminList / getChapterPaymentStatusMap),
// not a real sheet column.
export interface AdminDelegate {
  DelegateId: string;
  ChapterName: string;
  Status: string;
  FirstName: string;
  LastName: string;
  PreferredName: string;
  TShirtSize: string;
  ArrivalMode: string;
  ArrivalTime: string;
  PointOfEntry: string;
  KitConfirmed: boolean | string;
  KitConfirmedAt: string;
  SignatureURL: string;
  PaymentStatus: "Paid" | "Unpaid";
  [key: string]: unknown;
}
