import { Property, Object } from 'fabric-contract-api';

export const FACILITY = 'Facility';
export const CERTIFICATE = 'Certificate';

@Object()
export class Facility {
  @Property()
  public FacilityId!: string;

  @Property()
  public Name!: string;

  @Property()
  public Type!: string;

  @Property()
  public Owner!: string;

  @Property()
  public ReceiptLocationId!: string;
}

@Object()
export class FacilityCertificate {
  @Property()
  public LastVerified!: string;

  @Property()
  public IssuedTo!: string;

  @Property()
  public Issued!: string;

  @Property()
  public Effective!: string;

  @Property()
  public Expires!: string;

  @Property()
  public FacilityId!: string;

  @Property()
  public Certifier!: string;

  @Property()
  public CertificateId!: string;
}
