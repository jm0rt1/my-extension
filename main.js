var appStructure = {
  name: "App",
  packages: [
    {
      name: "Main",
      subPackages: [
        {
          name: "Controllers",
          classes: ["MainController"]
        },
        {
          name: "Models",
          classes: ["DeviceInfo", "SensorData"]
        },
        {
          name: "Views",
          classes: ["MainView"]
        }
      ]
    },
    {
      name: "Devices",
      subPackages: [
        {
          name: "Interfaces",
          interfaces: ["ISensorDevice"]
        },
        {
          name: "Implementations",
          classes: ["SensorDevice"]
        }
      ],
      realizations: [
        { className: "SensorDevice", interfaceName: "ISensorDevice" }
      ]
    },
    // Add other modules as needed
  ]
};


function init() {
  app.commands.register('your-extension:generate-elements', generateElements);
};

function generateElements() {
  var repository = app.repository;
  var factory = app.factory;

  // Start a transaction


  try {
    // Get the root model element
    var rootModel = repository.select("@UMLModel")[0];
    if (!rootModel) {
      // If no model exists, create one
      rootModel = factory.createModel({
        parent: null,
        modelInitializer: function (elem) {
          elem.name = "Model";
        },
        type: "UMLModel"
      });
    }

    // Create the application structure
    createAppStructure(appStructure, rootModel);


    app.toast.info("Elements generated successfully.");
  } catch (error) {

    app.toast.error("An error occurred: " + error.message);
  }

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