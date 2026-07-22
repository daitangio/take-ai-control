If you have zscaler installed, proceed as follows
1) Obtain the zscaler pem certificate from your browser/operating system and save into zscaler-root-ca.pem
2) Fix the podman machine with https://podman-desktop.io/docs/podman/adding-certificates-to-a-podman-machine
3) See https://docs.docker.com/guides/zscaler/ for information on docker fix

Currently it seems not to work for headroom image