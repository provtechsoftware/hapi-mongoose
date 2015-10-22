type primitive = boolean|number|string;

type HashMapString  = { [key: string]: string; };
type HashMapNumber  = { [key: string]: number; };
type HashMapBoolean = { [key: string]: boolean; };
type HashMapPrimitive = { [key: string]: primitive; };

type IResourceOptions = {
  name?: string|{
    singular: string,
    plural: string
  },
  methodAccess?: {
    getList?: boolean,
    getItem?: boolean,
    post?: boolean,
    put?: boolean,
    patch?: boolean,
    delete?: boolean,
  },
  exposed?: HashMapBoolean,
  pagination?: {
    limit: number
  },
  alias?: HashMapString
}

type IResourceOptionsExpanded = {
  name: {
    singular: string,
    plural: string
  },
  methodAccess: {
    getList: boolean,
    getItem: boolean,
    post: boolean,
    put: boolean,
    patch: boolean,
    delete: boolean,
  },
  exposed: HashMapBoolean,
  fieldProjection: HashMapBoolean,
  pagination: {
    limit: number
  },
  alias: HashMapString
}

type serialisationResultHandler = (serialisedData: string) => void;
