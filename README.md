
////ORBITAL GREENHOUSE GENERATOR////

MaCAD 2022 - IAAC
By Pablo Antuña Molina

Faculty: David Andrés León.
Assistant: Hesham Shawqy.

Final project for the Digital tools for cloud-based bata management seminar at MaCAD 2022 at IAAC.
Credits: Charbel Baliss, Jacinto Moros Montañés and Sophie Moore for their chunks of code.


////BRIEF////

This website showcases the research done in the BIMSC_Studio seminar: An spatial greenhouse system for orbital space stations and potentially for deep space exploration. It has a base module that varies its size depending on the plants harvested in it and it is capable of aggregating modifying the rules for the truncated octahedron (space-filling polyhedron).

The website consists on two parts:

PART01 - Module design:
First, you configure your greenhouse module(s) depending on the number of them and the maximum root length of the crops.
Secondly, you can choose between the differnt outer layers to display (facade or structural frame.
And thridly, it allows you to analyse the crops' needs through a series of diagrams (geometry, average temperature, soil ph, root length, water needs, plant height and nutrient type).

PART02 - Module aggregator:
Once the modules are designed, you can aggregate them following their geometrical constrains. You can also choose the number of astronauts these greenhouse are meant to feed and it will output the percentage of food per astronaut they can produce.

///////

PART01:
Inputs:
Number of modules - slider.
Maximum root legth - slider.
Skin layer displayed - radio-toolbar.
Planting diagram displayed - radio-toolbar.

Outputs:
Outer layer elements - meshes.
Colored diagrams - meshes.
Number of plant species per module and pot area per module - diagram mesh attributes.


PART02:
Inputs:
Aggregate? - checkbox.
Number of modules to aggregate - slider.
Number of astronauts - slider.

Outputs:
Aggregated modules - meshes.
Percentage of food produced per astronaut - float.