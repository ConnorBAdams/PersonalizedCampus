import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Dimensions, Animated, ScrollView, Keyboard } from 'react-native';
import { FontAwesome5, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import MapView from 'react-native-maps';
import { Marker, Circle, Polyline, fitToSuppliedMarkers } from 'react-native-maps';
import globalStyles from '../styles'
import Button from '../components/button'
import MarkerEditorComponent from './markerEditor'
import Carousel from 'react-native-snap-carousel';
import CarouselItem from './carouselItem'
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';

// How to use this component: 
// This displays the map with Google Maps and allows for node/route creation
// To use just the map: 
// Call the component and pass a location prop for user location
// Optionally, the style can be specified
// To allow for node placement:
// supply a 'nodes' array, a placement mode ('route' or 'node'),
// an onPress function for handling node creation in the parent component
// To allow Route creation: 
// pass a 'routes' array of route objects, onRouteConfirm to create a route
// probably some more stuff I'm forgetting

const MapComponent = props => {
    const [mapType, setMapType] = useState('standard')
    const [placementMode, setPlacementMode] = useState(null)
    const [placementEnabled, setPlacementEnabled] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [selectedNode, setSelectedNode] = useState(null)
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const [overviewEnabled, setOverviewEnabled] = useState(false)
    const [inspectObject, setInspectObject] = useState(null)
    const map = null;

    useEffect(() => {
        if (placementMode == null && props.placementMode != null)
        {
            setPlacementMode(props.placementMode)
        }
    })

    const changeSelectedIndex = (index) => {
        setSelectedIndex(index)
        // todo : fit these to the map view
    }

    const toggleModal = () => {
        if (modalVisible === false) {
            setModalVisible(true)
        } else {
            setModalVisible(false)
        }
    }

    const updateNode = (title, descr) => {
        node = selectedNode
        node.name = title
        node.description = descr
        setSelectedNode(node)
    }

    const editMarker = marker => {
        if (modalVisible === false) {
            setSelectedNode(marker)
            setModalVisible(true)
        } else {
            setModalVisible(false)
        }
    }

    const toggleMapViewMode = () => {
        if (mapType === 'standard' ) 
            setMapType('satellite'); 
        else 
            setMapType('standard')
    }

    const togglePlacementMode = () => {
        if (placementMode === 'node' ) 
            setPlacementMode('route'); 
        else 
            setPlacementMode('node')
    }

    const nodePressed = (node) => {
        console.log('Selected node: ', node)
        if (placementMode=='route') {
            props.addNodeToRoute(node) 
        }
        else if(!placementEnabled && props.carouselEnabled)
        {
            console.log(node, ' selected')
            setInspectObject(node)
            setSelectedIndex(-1)
        }
    }

    const polylinePressed = (poly) => {
        if (props.carouselEnabled) {
            console.log(poly, ' selected')
            setInspectObject(props.routes[poly.id])
            setSelectedIndex(poly.id)
        }
    }

    const mapPress = (e) => {
        console.log('Map press')
        Keyboard.dismiss()
        if (props.carouselEnabled) {
            //setSelectedIndex(-1)
            setInspectObject(null)
            setSelectedIndex(-1)
        }
    }
    
    const handleDelete = (item) => { 
        props.deleteComponent(item);
        setInspectObject(null)
        setSelectedIndex(-1)
    }

    const carouselItem = ({item, index}) => {
        return (
            <CarouselItem 
            contents={item}
            type={'route'} 
            overviewToggle={setOverviewEnabled} />    
        );
    }

    return (
        <View style={styles.container}>
            {modalVisible && 
            <MarkerEditorComponent 
                onSubmit={updateNode} 
                toggle={toggleModal} 
                node={selectedNode} 
                visible={modalVisible} />}
            <View style={{...styles.mapTopButtons, top: (props.takingTour)?150:15}} pointerEvents="box-none">
            <View style={styles.mapModeButton} pointerEvents="box-none">
            {placementMode != null &&
                <TouchableOpacity style={styles.icon} onPress={() => togglePlacementMode() } >
                {placementMode=='node' && <FontAwesome5 name="map-marker" size={32} />}
                {placementMode=='route' && <FontAwesome5 name="route" size={32} style={{marginLeft:4, marginRight:4}} />}
                </TouchableOpacity>
            }
            {props.enableQRReader != null &&
                <TouchableOpacity style={styles.icon} onPress={() => props.enableQRReader() } >
                <FontAwesome5 name="qrcode" style={{width: 38, textAlign:'center'}} size={32} />
                </TouchableOpacity>
            }
            </View>
            <View style={styles.mapStyleButton}>
                <TouchableOpacity style={styles.icon} onPress={() => toggleMapViewMode()} >
                {mapType=='standard' && <FontAwesome5 name="satellite" size={32} style={{marginRight: 2, marginLeft: 2}} />}
                {mapType=='satellite' && <FontAwesome5 name="map" size={32} />}
                </TouchableOpacity>
            </View>
            </View>
            <View style={{zIndex: -1, elevation: -1}}>
            <MapView 
            style={(props.style != null) ? props.style : styles.mapStyle} 
            mapType={mapType}
            onUserLocationChange={(location)=>props.onUserLocationChange(location)}
            showsUserLocation={props.takingTour && props.showUser}
            //showsMyLocationButton={props.takingTour && props.showUser}
            //followsUserLocation={props.takingTour && props.showUser}
            //showsCompass={props.takingTour && props.showUser}
            loadingEnabled={true}
            //ref={map => {this.map = map}}
            initialRegion={{latitude:props.location.coords.latitude, longitude:props.location.coords.longitude, latitudeDelta: 0.0922, longitudeDelta: 0.0421}} 
            onPress={e => {props.onPress != null && !overviewEnabled ? props.onPress(e, placementMode) : mapPress(e)}}
            > 
            {/* { (props.showUser != null && props.showUser === true || props.showUser == null) && 
            <Marker key={1000.1} 
            coordinate={{latitude:props.location.coords.latitude, longitude:props.location.coords.longitude}}
            title="Your Location" >
                <MaterialIcons name="person-pin-circle" size={42} color="crimson" />
            </Marker> } */}
            {/* {console.log(props.nodes)} */}
            {( props.nodes != undefined && props.nodes.length > 0 && props.nodes[0] != null) ? 
            props.nodes.map((marker, index) => { 
                if (marker.type==='Node') 
                {
                    //console.log('It\'s a node');
                    return <Marker
                    key={marker.id.toString()}
                    identifier={marker.id.toString()}
                    coordinate={{latitude:marker.latitude, longitude:marker.longitude}}
                    title={marker.name}
                    description={marker.description}
                    onCalloutPress={() => editMarker(marker)}
                    onPress={() => {nodePressed(marker)}}
                    />
                }
                else if (marker.type==='Circle') {
                    //console.log('It\'s a circle');
                    return [<Circle
                    key={'-100'}
                    identifier={'-100'}
                    center={{latitude:marker.latitude, longitude:marker.longitude}}
                    radius={marker.radius}
                    fillColor={marker.fillColor}
                    title={marker.name}/>, 
                    <Marker
                    key={marker.id+0.5}
                    coordinate={{latitude:marker.latitude, longitude:marker.longitude}}
                    title={marker.name}
                    anchor={{x: 0.5, y: 0.5}}>
                    <MaterialCommunityIcons name="circle-double" size={32} color="black"/>
                    </Marker>
                ]}
            }) 
            : null}
            {( props.routes != undefined && props.routes.length > 0 && props.routes[0] != null) ? 
            props.routes.map((marker, index) => { 
                if (marker.length == 0) return;
                coords = [];
                for (var i = 0; i < props.nodes.length; i++) {
                    if (marker.nodes.includes(props.nodes[i].id))
                        coords.push({latitude: props.nodes[i].latitude, longitude:props.nodes[i].longitude})
                }
                return <Polyline
                key={marker.id + 0.5}
                tappable={true}
                onPress={() => {polylinePressed(marker)}}
                strokeColor={`rgb(${marker.routeColor.r}, ${marker.routeColor.g}, ${marker.routeColor.b})`}
                strokeWidth={ (selectedIndex != -1 && index == selectedIndex ) ? 8 : 4}
                coordinates={coords}
                />
            }) 
            : null}
            </MapView>  
            </View>
            { placementMode === 'route' &&
            <View style={styles.mapBottomButtons}>
            <View style={styles.routeConfirmButton}>
            <TouchableOpacity style={styles.icon} onPress={() => props.onRouteConfirm()} > 
                <FontAwesome5 name="check-circle" size={32} />
            </TouchableOpacity>
            </View>
            </View>} 
            { (props.routes != undefined && props.carouselEnabled ) ? 
            <View style={styles.carouselContainer} pointerEvents="box-none">
            <CarouselItem
            contents={inspectObject}
            type={'route'} 
            deleteComponent={handleDelete}
            updateComponent={props.updateComponent}
            editComponent={editMarker}
            overviewToggle={setOverviewEnabled} />    
            </View>
            : null}  
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mapStyle: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height*.9,
    },
    icon: {
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'black',
        padding: 2,
        elevation: 5,
        backgroundColor: '#fff',
    },
    mapTopButtons: {
        zIndex: 1,
        position:'absolute',
        alignSelf: 'flex-end',
        flexDirection: 'row',
        justifyContent:'space-between',
        alignItems: 'flex-end',
    },
    mapBottomButtons: {
        zIndex: 1,
        bottom: 75,
        //marginTop: -50,
        alignSelf: 'flex-end',
        flexDirection: 'row',
        justifyContent:'space-between',
        alignItems: 'flex-end',
        marginBottom: 4.5
    },
    mapModeButton: {
        marginRight: Dimensions.get('window').width * 0.72, // sigh
    },
    mapStyleButton: {
        marginRight: 10,
    },
    routeConfirmButton: {
        marginRight: 10,
        padding: 2
    },
    carouselContainer: {
        flex: 1,
        height: Dimensions.get('window').height,
        width: Dimensions.get('window').width,
        bottom: 0,
        position: 'absolute',
        flexBasis: 1,
        flexGrow: 1,
        flexShrink: 1,
        zIndex: 10,
    },
    carousel: {
        backgroundColor:'grey',
        flexBasis: 1,
        flexGrow: 1,
        flexShrink: 1,
        flex: 1,
        zIndex: 10,
        // flexDirection:'row',
        // flexWrap:'wrap-reverse',
    },
});


export default MapComponent;