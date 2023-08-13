import React, {useCallback, useEffect, useRef} from 'react';
import {StyleSheet, View, PanResponder, Button} from 'react-native';
import {Canvas, MobileModel, torch, Module} from 'react-native-pytorch-core';
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';
import * as RNFS from "react-native-fs";

export default function App() {
    const drawingContext = useRef(null);
    const isDrawing = useRef(false);
    const strokePath = useRef([]);
    const model = useRef(null)

    useEffect( () => {
        loadModel().then()
    },[])


    const loadModel = async () => {
        if (model.current !== null) {
            return
        }

        try {
            const path = resolveAssetSource(require('./assets/models/classify_image.ptl'))

            const downloadDest = `${RNFS.DocumentDirectoryPath}/classify_image.ptl`;
            const result = await RNFS.downloadFile({
                fromUrl: path.uri,
                toFile: downloadDest,
            }).promise;

            if (result.statusCode !== 200) {
                throw new Error('Failed to download asset');
            }

            model.current = await torch.jit._loadForMobile(downloadDest, "cpu");
            console.log("successfully loaded model")
        } catch (err) {
            console.error(err)
        }
    }

    async function loadModelAndPredict() {
        try {
            const inputSize = 784
            const inputTensor = torch.randn([1, inputSize]);

            let outputTensor = await model.current.forward(inputTensor);
            outputTensor = outputTensor.softmax(-1)

            const outputData = Array.from(outputTensor.data());

            const predictedClass = outputData.indexOf(Math.max(...outputData));

            console.log("Predicted class:", predictedClass);
        } catch (error) {
            console.error("An error occurred:", error);
        }
    }

    const handleContext2D = useCallback(
        async (ctx) => {
            drawingContext.current = ctx;
        },
        [],
    );

    const handleTouchStart = (event) => {
        if (!isDrawing.current) {
            const {locationX, locationY} = event.nativeEvent;
            strokePath.current = [];
            strokePath.current.push({x: locationX, y: locationY});
            isDrawing.current = true;
            drawPath();
        }
    };

    const handleTouchMove = (event) => {
        if (isDrawing.current) {
            const {locationX, locationY} = event.nativeEvent;
            strokePath.current.push({x: locationX, y: locationY});
            drawPath();
        }
    };

    const handleTouchEnd = () => {
        isDrawing.current = false;
    };

    const drawPath = () => {
        const ctx = drawingContext.current;
        if (ctx) {
            ctx.beginPath();

            ctx.moveTo(strokePath.current[0].x, strokePath.current[0].y);

            for (let i = 1; i < strokePath.current.length; i++) {
                ctx.lineTo(strokePath.current[i].x, strokePath.current[i].y);
            }

            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 10;
            ctx.stroke();
            ctx.closePath();
            ctx.invalidate().then(() => {
            });
        }
    };

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: handleTouchStart,
        onPanResponderMove: handleTouchMove,
        onPanResponderRelease: handleTouchEnd,
        onPanResponderTerminate: handleTouchEnd,
    });

    const clearDrawing = () => {
        const ctx = drawingContext.current;
        if (ctx) {
            ctx.clear();
            ctx.invalidate().then(() => {
            });
        }
    }

    const classify = async () => {
        await loadModelAndPredict()
    }

    return (
        <>
            <View style={styles.container}>
                <Canvas style={StyleSheet.absoluteFill} onContext2D={handleContext2D}/>
                <View {...panResponder.panHandlers} style={styles.touchArea}/>
            </View>
            <View style={styles.button}>
                <Button title={"Classify Digit"} onPress={classify}></Button>
                <Button title={"Clear"} onPress={clearDrawing}></Button>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'blue'
    },
    touchArea: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
    },
    button: {
        flex: 1
    }
});
