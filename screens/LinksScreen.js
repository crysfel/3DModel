import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Expo, { Asset, GLView } from 'expo';
import * as THREE from 'three';
import ExpoTHREE from 'expo-three';
global.THREE = THREE;
require('./OBJLoader');


console.disableYellowBox = true;


export default class LinksScreen extends Component {
  static navigationOptions = {
    title: '3D Model',
  };

  state = {
    loaded: false,
  }

  componentWillMount() {
    this.preloadAssetsAsync();
  }

  async preloadAssetsAsync() {
    await Promise.all([
      require('../assets/mitch_final.obj'),
      require('../assets/uv2.jpg'),
    ].map((module) => Asset.fromModule(module).downloadAsync()));
    this.setState({ loaded: true });
  }

  onContextCreate = async (gl) => {
    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;
    console.log(width, height);
    gl.createRenderbuffer = () => {};
    gl.bindRenderbuffer = () => {};
    gl.renderbufferStorage  = () => {};
    gl.framebufferRenderbuffer  = () => {};

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.5, 1000 );
		camera.position.z = 6;
    camera.position.x = 0;
    camera.position.y = 0;

    const scene = new THREE.Scene();
		const ambient = new THREE.AmbientLight( 0x101030 );
		const directionalLight = new THREE.DirectionalLight( 0xffeedd );
		directionalLight.position.set( 0, 0, 1 );
    scene.add(ambient);
		scene.add(directionalLight);

    // Texture
    const textureAsset = Asset.fromModule(require('../assets/uv2.jpg'));
    const texture = new THREE.Texture();
    texture.image = {
      data: textureAsset,
      width: textureAsset.width,
      height: textureAsset.height,
    };;
		texture.needsUpdate = true;
    texture.isDataTexture = true;
    const material =  new THREE.MeshPhongMaterial({ map: texture });

    // Object
    const modelAsset = Asset.fromModule(require('../assets/mitch_final.obj'));
    const loader = new THREE.OBJLoader();
    const model = loader.parse(
      await Expo.FileSystem.readAsStringAsync(modelAsset.localUri));

    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = material;
      }
    });

    model.position.y = -1;
		scene.add(model);


    const renderer = ExpoTHREE.createRenderer({ gl });
		renderer.setSize(width, height);


    const animate = () => {

			// camera.lookAt( scene.position );
      // model.rotation.x += 0.07;
      model.rotation.y += 0.04;

			renderer.render( scene, camera );
      gl.endFrameEXP();
      requestAnimationFrame(animate);
    };
    animate();
  };

  render() {
    return (
      <View style={styles.container}>
        <Text>Un avatar:</Text>
        { this.state.loaded &&
          <GLView
            ref={(ref) => this.glView = ref}
            style={styles.glview}
            onContextCreate={this.onContextCreate}
          />
        }
        <Text>En la app! ok ok</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
  glview: {
    width: 350,
    height: 500
  },
});
