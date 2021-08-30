import React, { useEffect } from 'react';
import { SafeAreaView, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useMutation, useQuery } from 'react-query';

import Icon from 'react-native-vector-icons/FontAwesome5';
import { Text } from 'dripsy';

import Spinner from 'react-native-loading-spinner-overlay';
import { ListItem } from 'react-native-elements';

import { downloadFile, getFolderContents } from 'api/dropboxClient';

import { ScreenPropsT } from 'App';

export type PropsT = ScreenPropsT<'DropboxNavigator'>;

const DropboxNavigator = (props: PropsT) => {
  const path = props.route.params.path;
  const folderName = props.route.params.name;

  useEffect(() => {
    const headerTitle = folderName;
    props.navigation.setOptions({
      headerTitle,
    });
  }, []);

  const { data } = useQuery(['dropbox-contents', path], () =>
    getFolderContents(path),
  );

  const { mutate: doDownloadFile, isLoading } = useMutation(downloadFile, {
    onSuccess: (response) => {
      if (response) {
        if (props.navigation.canGoBack()) {
          props.navigation.popToTop();
        }
        props.navigation.push('Player', {
          musicData: {
            name: response.name,
            uri: response.uri,
          },
        });
      }
    },
  });

  return (
    <SafeAreaView>
      <FlatList
        data={data?.data.entries ?? []}
        renderItem={({ item, separators }) => {
          const isFile = item['.tag'] === 'file';
          const { path_display: path, name } = item;
          const isDownloadable =
            item['.tag'] === 'file'
              ? /.mp3$/.test(item.name) && item.is_downloadable
              : false;
          return (
            <TouchableOpacity
              onPress={async () => {
                if (item['.tag'] === 'folder') {
                  props.navigation.push('DropboxNavigator', {
                    path,
                    name,
                  });
                } else {
                  if (isDownloadable) {
                    doDownloadFile({
                      path: item.path_display,
                      name: item.name,
                    });
                  } else {
                    Alert.alert(
                      'Unsupported file type',
                      'Unable to download this file. Please select an .mp3 file',
                    );
                  }
                }
              }}
              testID={`clickable-${item.name}`}
            >
              <ListItem bottomDivider={true}>
                {item['.tag'] === 'folder' ? (
                  <Icon name="folder" size={20} light />
                ) : null}
                <ListItem.Content>
                  <Text
                    as={ListItem.Title}
                    sx={{ color: isFile && !isDownloadable ? 'grey' : 'black' }}
                  >
                    {item.name}
                  </Text>
                </ListItem.Content>
              </ListItem>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item.id}
      />

      <Spinner visible={isLoading} />
    </SafeAreaView>
  );
};

export default DropboxNavigator;
