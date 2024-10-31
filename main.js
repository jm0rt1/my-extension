// var appStructure = {
//   name: "App",
//   packages: [
//     {
//       name: "Main",
//       subPackages: [
//         {
//           name: "Controllers",
//           classes: ["MainController"]
//         },
//         {
//           name: "Models",
//           classes: ["DeviceInfo", "SensorData"]
//         },
//         {
//           name: "Views",
//           classes: ["MainView"]
//         }
//       ]
//     },
//     {
//       name: "Devices",
//       subPackages: [
//         {
//           name: "Interfaces",
//           interfaces: ["ISensorDevice"]
//         },
//         {
//           name: "Implementations",
//           classes: ["SensorDevice"]
//         }
//       ],
//       realizations: [
//         { className: "SensorDevice", interfaceName: "ISensorDevice" }
//       ]
//     },
//     // Add other modules as needed
//   ]
// };


function init() {
  app.commands.register('your-extension:generate-elements', generateElements);
};

function generateElements() {
  // Get a reference to top-level project
  var project = app.repository.select("@Project")[0]

  // Create a UMLModel element as a child of project
  var model1 = app.factory.createModel({ id: "UMLModel", parent: project })

  // Create a UMLClass element as a child of the model
  var class1 = app.factory.createModel({ id: "UMLClass", parent: model1 })

  // Create a UMLAttribute element and add to the field 'attributes' of the class
  var attr1 = app.factory.createModel({ id: "UMLAttribute", parent: class1, field: "attributes" })

  // Create a UMLClass with options
  var options = {
    id: "UMLClass",
    parent: model1,
    modelInitializer: function (elem) {
      elem.name = "MyClass";
      elem.isAbstract = true;
    }
  }
  var class2 = app.factory.createModel(options);
}


function createAppStructure(structure, parent) {
  var factory = app.factory;

  // Create the root package
  var appPackage = factory.createModel({
    parent: parent,
    modelInitializer: function (elem) {
      elem.name = structure.name;
    },
    type: "UMLPackage"
  });

  // Recursive function to create packages and their contents
  createPackages(structure.packages, appPackage);
}

function createPackages(packages, parent) {
  var factory = app.factory;
  var repository = app.repository;

  packages.forEach(function (pkg) {
    var newPkg = factory.createModel({
      parent: parent,
      modelInitializer: function (elem) {
        elem.name = pkg.name;
      },
      type: "UMLPackage"
    });

    // Create interfaces
    if (pkg.interfaces) {
      pkg.interfaces.forEach(function (interfaceName) {
        factory.createModel({
          parent: newPkg,
          modelInitializer: function (elem) {
            elem.name = interfaceName;
          },
          type: "UMLInterface"
        });
      });
    }

    // Create classes
    if (pkg.classes) {
      pkg.classes.forEach(function (className) {
        factory.createModel({
          parent: newPkg,
          modelInitializer: function (elem) {
            elem.name = className;
          },
          type: "UMLClass"
        });
      });
    }

    // Create sub-packages
    if (pkg.subPackages) {
      createPackages(pkg.subPackages, newPkg);
    }

    // Create realizations
    if (pkg.realizations) {
      pkg.realizations.forEach(function (rel) {
        var cls = repository.lookup({ name: rel.className, parent: newPkg });
        var iface = repository.lookup({ name: rel.interfaceName, parent: newPkg });

        if (cls && iface) {
          factory.createModel({
            parent: newPkg,
            modelInitializer: function (elem) {
              elem.name = "";
              elem.source = cls;
              elem.target = iface;
            },
            type: "UMLInterfaceRealization"
          });
        }
      });
    }
  });
}

exports.init = init