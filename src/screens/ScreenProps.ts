import { StackScreenProps } from '@react-navigation/stack';

type StacksT = {
  Home: undefined;
  Player: {
    musicData: { uri: string; name: string };
  };
  DropboxNavigator: {
    path: string;
    name: string;
  };
};

export type ScreenPropsT<T extends keyof StacksT> = StackScreenProps<
  StacksT,
  T
>;
