import { Component } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";

interface IGlobeWrapperState {
    geoJson: any | null;
}

export class GlobeWrapper extends Component<{}, IGlobeWrapperState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            geoJson: null
        };
    }

    async componentDidMount() {
        const res = await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
        const worldData = await res.json();
        const geoJson = topojson.feature(worldData, worldData.objects.countries);
        this.setState({ geoJson });
    }

    render() {
        const { geoJson } = this.state;

        if (!geoJson) {
            return <div className="text-center text-sm text-gray-500">Loading globe...</div>;
        }

        return <RotatingGlobe geoJson={geoJson} size={600} />;
    }
}

interface IRotatingGlobeProps {
    geoJson: any;
    size: number;
}

interface IRotatingGlobeState {
    rotation: number;
}

class RotatingGlobe extends Component<IRotatingGlobeProps, IRotatingGlobeState> {
    private animationFrame: number = 0;

    constructor(props: IRotatingGlobeProps) {
        super(props);
        this.state = {
            rotation: 0
        };
    }

    componentDidMount() {
        this.animate();
    }

    componentWillUnmount() {
        cancelAnimationFrame(this.animationFrame);
    }

    animate = () => {
        this.animationFrame = requestAnimationFrame(() => {
            this.setState(
                (prev) => ({ rotation: prev.rotation + 0.2 }),
                this.animate
            );
        });
    };

    render() {
        const projection = d3
            .geoOrthographic()
            .fitSize([this.props.size, this.props.size], this.props.geoJson)
            .rotate([this.state.rotation, -10]);

        const geoGenerator = d3.geoPath().projection(projection);

        return (
            <svg width={this.props.size} height={this.props.size}>
                {this.props.geoJson.features.map((feature: any, idx: number) => (
                    <path
                        key={idx}
                        d={geoGenerator(feature)!}
                        fill="#FFFFFF"
                        stroke="#aaa"
                        strokeLinecap="round"
                        strokeWidth={0.5}
                    />
                ))}
            </svg>
        );
    }
}

export default GlobeWrapper;
