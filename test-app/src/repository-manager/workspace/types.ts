export interface IConfiguration<I = any> {
  id: string;
  logging?: boolean;
  infrastructure: I;
}
